# cg-rank

## Project setup

```
npm install
```

### Compiles and hot-reloads for development

```
npm run serve
```

### Compiles and minifies for production

```
npm run build
```

### Lints and fixes files

```
npm run lint
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).

Supported Tags:
{cgRank}
{cgRank::Separator}
{cocRank}
{cocRank::Separator}
{cgOrd}
{cocOrd}

{cgTotal}
{cocTotal}
{cgTotal::Separator}
{cocTotal::Separator}

{cgPerc}
{cgPerc::Places}
{cgPerc::Places::Decimal}
{cocPerc}
{cocPerc::Places}
{cocPerc::Places::Decimal}
{cgPercOrd}
{cocPercOrd}

{date::MOMENT_JS_DATE_STRING}

<!-- var docs = document.getElementById('doc');
function generate() {
    var reader = new FileReader();
    if (docs.files.length === 0) {
        alert("No files selected")
    }
    reader.readAsBinaryString(docs.files.item(0));

    reader.onerror = function (evt) {
        console.log("error reading file", evt);
        alert("error reading file" + evt)
    }
    reader.onload = function (evt) {
        const content = evt.target.result;
        var zip = new PizZip(content);
        // Same code as in the main HTML example.
    }
} -->
