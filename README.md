[![Netlify Status](https://api.netlify.com/api/v1/badges/18028a2a-1698-479b-b2c9-7637be642535/deploy-status)](https://app.netlify.com/sites/practical-aryabhata-a32269/deploys)

# CG Rank

CG Rank is a website that can automatically integrate your current ranking on [codingame.com](https://www.codingame.com/home) into a resumé (or any other .docx file) that contains one of several predefined template strings. CG Rank is not affiliated with codingame.com.

If all you want to do is use CG Rank with your resumé, you should visit the live site at [https://www.cgrank.com](https://www.cgrank.com/). If you are interested in forking or contributing to CG Rank site, read on...

### Getting Started

CG Rank is built with Vue.js and Vuetify. The core of the site is located in the [`src`](https://github.com/dheidelberger/cg-rank/tree/master/src) folder. It also uses a Netlify serverless function to proxy a series of API calls to Codingame. The serverless function code is in the [`src-functions`](https://github.com/dheidelberger/cg-rank/tree/master/src-functions) folder.

Once you have cloned the repository, you can run `npm run serve` to debug the site or `npm run build` to build it. The site will be run locally at [http://localhost:8080](http://localhost:8080).

### Serverless Netlify function

The Netlify serverless function returns the following information when given a Codingame profile name:
`{handle,name,id,avatar,ranking:{codingame:{rank,totalPlayers},clashOfCode:{rank,totalPlayers}}}`
Avatar is optional and is only returned if there is an avatar associated with that profile.

### Template Tags

A full list of template tags is in the [tags.js](https://github.com/dheidelberger/cg-rank/blob/master/src/tags.js) file (or on the site on the playground page). All template strings must be surrounded by braces: {}. Many of the template strings have alternate versions that allow formatting changes, like setting the thousands separator.

The templating system is built on top of the [docxtemplater](https://docxtemplater.com/) library. Specifically, it implements a [custom parser](https://docxtemplater.readthedocs.io/en/latest/configuration.html#custom-parser) that overrides the default docxtemplater tag parser.

Each tag has the following structure:

```
'cocRank::SEPARATOR': {
    tag: 'cocRank::SEPARATOR',
    description:
        'Current ranking in Clash of Code with thousands places separated by SEPARATOR',
    regex: '(cocRank)::(.*?)',
    priority: 50,
    transform: (x, match) =>
        numberWithCommas(x.ranking.clashOfCode.rank, JSON.parse(match)[1]),
}
```

-   `tag` is the printed name of the tag
-   `description` is the printed description
-   `regex` is a regular expression string that is used to see if a given template string matches this tag. The parser takes each tag that docxtemplater gives it, and loops through all its known tags using the regex to find the appropriate tag.
-   `priority` is used to sort the tags in order of importance. The regex for a tag that doesn't take additional parameters can sometimes override the regex for a tag with extra parameters. Priority ensures that more specific tags get checked first. Can be a number from 0-100, with lower numbers getting highest prirority. For now, tags with no parameters are 100, tags with one parameter are 50, and tags with two parameters are 10.
-   `transform` is a function that gets passed to the tag to transform the data. `x` is the data returned from the serverless function, `match` is the result of running `.replace(REGEX)` on the tag name JSON stringified. This is a bit convoluted. The tag name is run through a replace function as follows:

```
TEMPLATESTRING = TEMPLATESTRING.replace(REGEX, (match, p1, p2, p3) => {
    const newText = tag.transform(RANKINGDATA, JSON.stringify([p1, p2, p3]));
    return newText;
});
```

Note that the way replace callback functions are created when using regex, the individual matching groups are passed as parameters rather than as an array. There could be as many params as there are matching groups, but since none of the tags currently use more than three matching groups, we just need to pass p1-p3 to the replace function. For tags with fewer than three matching groups, the extra matching groups are undefined (as in, their values are not defined or guaranteed to be consistent, they aren't literally the Javascript value "undefined")

### Contributing

Feel free to submit a pull request to improve the code.

### Credits

This project is written and maintained by [David Heidelberger](http://www.davidheidelberger.com). I'm a full-time video editor and producer and part-time software developer. I use many of the tools I've written every day at my day job on a documentary series on PBS. I'm available for workflow consultation and custom software solutions for your post-production workflow. To get in touch about a consult, or just to tell me how you're using the app, I'd love to [hear from you](mailto:david.heidelberger@gmail.com).

### License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
