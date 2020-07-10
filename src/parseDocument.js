const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
import { tags } from './tags';
import { saveAs } from 'file-saver';

//Much of this code is adapted from the docxtemplater documentation
//https://docxtemplater.readthedocs.io/en/latest/generate.html

function errorHandler(error) {
    console.log(JSON.stringify({ error: error }, replaceErrors));

    if (error.properties && error.properties.errors instanceof Array) {
        const errorMessages = error.properties.errors
            .map(function(error) {
                return error.properties.explanation;
            })
            .join('\n');
        console.log('errorMessages', errorMessages);
        // errorMessages is a humanly readable message looking like this :
        // 'The tag beginning with "foobar" is unopened'
    }
    throw error;
}

function replaceErrors(key, value) {
    if (value instanceof Error) {
        return Object.getOwnPropertyNames(value).reduce(function(error, key) {
            error[key] = value[key];
            return error;
        }, {});
    }
    return value;
}

function parseDocument(document, data) {
    let filename = document.name.split('.');
    let idx = filename.length - 2;
    if (filename.length < 2) {
        idx = 0;
    }

    filename[idx] += ' Ranked';

    filename = filename.join('.');

    let reader = new FileReader();
    reader.readAsBinaryString(document);
    reader.onerror = function(evt) {
        console.log('error reading file', evt);
        alert('error reading file' + evt);
    };
    const options = {
        parser: function(docTag) {
            return {
                get: function() {
                    let keys = Object.keys(tags);
                    let tagArray = keys
                        .map((key) => tags[key])
                        .sort((a, b) => a.priority - b.priority);
                    let outText = docTag;
                    let matched = false;
                    for (let tag of tagArray) {
                        const thisRX = new RegExp(`^${tag.regex}$`, 'g');
                        outText = outText.replace(
                            thisRX,
                            (match, p1, p2, p3) => {
                                let jString = JSON.stringify([p1, p2, p3]);

                                const newText = tag.transform(data, jString);

                                matched = true;
                                return newText;
                            }
                        );
                    }
                    if (matched) {
                        return outText;
                    } else {
                        return `{${outText}}`;
                    }
                },
            };
        },
    };
    reader.onload = function(evt) {
        const content = evt.target.result;
        let zip = new PizZip(content);
        let doc;
        try {
            doc = new Docxtemplater(zip, options);
        } catch (error) {
            // Catch compilation errors (errors caused by the compilation of the template : misplaced tags)
            errorHandler(error);
        }

        doc.setData(data);
        try {
            // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
            doc.render();
        } catch (error) {
            // Catch rendering errors (errors relating to the rendering of the template : angularParser throws an error)
            errorHandler(error);
        }

        var out = doc.getZip().generate({
            type: 'blob',
            mimeType:
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        }); //Output the document using Data-URI
        saveAs(out, filename);
    };
}

export { parseDocument };
