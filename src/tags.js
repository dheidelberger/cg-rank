/* eslint-disable */
const moment = require('moment');
const indicator = require('ordinal/indicator');

const STANDARD_THREE_PARAM_PRIORITY = 10;
const STANDARD_TWO_PARAM_PRIORITY = 50;
const STANDARD_ONE_PARAM_PRIORITY = 100;

//Source:
//https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
function numberWithCommas(x, separator) {
    var parts = x.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    return parts.join('.');
}

function rounded(x, places) {
    if (places === 0) {
        return Math.round(x);
    }
    let z = x * 10 ** places;
    z = Math.round(z);
    z = z / 10 ** places;
    return z;
}

// ranking: { codingame: { rank, totalPlayers }, clashOfCode: { rank, totalPlayers } }}
//We run the regex to pull matches from the template
//We the put the matches through the transform function,
// x should be the data
//match should be an array of the regex result (gets p1, p2, p3 from .replace callback function)
//Priority is so that we can replace the more complicated tags first before we do the simple ones
//For example, if we do cgPerc::PLACES before cgPerc::PLACES::DECIMAL,
// its regex will trigger on cgPerc:: PLACES:: DECIMAL
let tags = {
    cgRank: {
        tag: 'cgRank',
        description: 'Current ranking on codingame.com with no formatting',
        regex: '(cgRank)',
        priority: STANDARD_ONE_PARAM_PRIORITY,
        transform: (x) => x.ranking.codingame.rank,
    },
    'cgRank::SEPARATOR': {
        tag: 'cgRank::SEPARATOR',
        description:
            'Current ranking on codingame.com with thousands places separated by SEPARATOR. For example, rank 3000 and tag cgRank::, leads to 3,000.',
        regex: '(cgRank)::(.*?)',
        priority: STANDARD_TWO_PARAM_PRIORITY,
        transform: (x, match) =>
            numberWithCommas(x.ranking.codingame.rank, JSON.parse(match)[1]),
    },
    cocRank: {
        tag: 'cocRank',
        description: 'Current ranking in Clash of Code with no formatting',
        regex: '(cocRank)',
        priority: STANDARD_ONE_PARAM_PRIORITY,
        transform: (x) => x.ranking.clashOfCode.rank,
    },
    'cocRank::SEPARATOR': {
        tag: 'cocRank::SEPARATOR',
        description:
            'Current ranking in Clash of Code with thousands places separated by SEPARATOR',
        regex: '(cocRank)::(.*?)',
        priority: STANDARD_TWO_PARAM_PRIORITY,
        transform: (x, match) =>
            numberWithCommas(x.ranking.clashOfCode.rank, JSON.parse(match)[1]),
    },
    cgOrd: {
        tag: 'cgOrd',
        description: `Ordinal for current codingame.com ranking (e.g. "st," "nd," or "rd")`,
        regex: '(cgOrd)',
        priority: STANDARD_ONE_PARAM_PRIORITY,
        transform: (x) => indicator(x.ranking.codingame.rank),
    },
    cocOrd: {
        tag: 'cocOrd',
        description: `Ordinal for current Clash of Code ranking`,
        regex: '(cocOrd)',
        priority: STANDARD_ONE_PARAM_PRIORITY,
        transform: (x) => indicator(x.ranking.clashOfCode.rank),
    },
    cgTotal: {
        tag: 'cgTotal',
        description: `Total number of players on codingame.com with no formatting`,
        regex: '(cgTotal)',
        priority: STANDARD_ONE_PARAM_PRIORITY,
        transform: (x) => x.ranking.codingame.totalPlayers,
    },
    cocTotal: {
        tag: 'cocTotal',
        description: `Total number of players on Clash of Code with no formatting`,
        regex: '(cocTotal)',
        priority: STANDARD_ONE_PARAM_PRIORITY,
        transform: (x) => x.ranking.clashOfCode.totalPlayers,
    },
    'cgTotal::SEPARATOR': {
        tag: 'cgTotal::SEPARATOR',
        description:
            'Total number of players on codingame.com with thousands places separated by SEPARATOR',
        regex: '(cgTotal)::(.*?)',
        priority: STANDARD_TWO_PARAM_PRIORITY,
        transform: (x, match) =>
            numberWithCommas(
                x.ranking.codingame.totalPlayers,
                JSON.parse(match)[1]
            ),
    },
    'cocTotal::SEPARATOR': {
        tag: 'cocTotal::SEPARATOR',
        description:
            'Total number of players on Clash of Code with thousands places separated by SEPARATOR',
        regex: '(cocTotal)::(.*?)',
        priority: STANDARD_TWO_PARAM_PRIORITY,
        transform: (x, match) =>
            numberWithCommas(
                x.ranking.clashOfCode.totalPlayers,
                JSON.parse(match)[1]
            ),
    },
    cgPerc: {
        tag: 'cgPerc',
        description: `Codingame.com ranking as a percentile rounded to up to 2 decimal places (e.g. 100th out of 10,000 players is "1" and 100/15,000 is "0.67")`,
        regex: '(cgPerc)',
        priority: STANDARD_ONE_PARAM_PRIORITY,
        transform: (x) =>
            rounded(
                (100 * x.ranking.codingame.rank) /
                    x.ranking.codingame.totalPlayers,
                2
            ),
    },
    'cgPerc::PLACES': {
        tag: 'cgPerc::PLACES',
        description: `Codingame.com ranking as a percentile rounded to up to PLACES decimal places (e.g. 100/15,000 with PLACES=1 is "0.7")`,
        regex: '(cgPerc)::(.*?)',
        priority: STANDARD_TWO_PARAM_PRIORITY,
        transform: (x, match) =>
            rounded(
                (100 * x.ranking.codingame.rank) /
                    x.ranking.codingame.totalPlayers,
                +JSON.parse(match)[1]
            ),
    },
    'cgPerc::PLACES::DECIMAL': {
        tag: 'cgPerc::PLACES::DECIMAL',
        description: `Codingame.com ranking as a percentile rounded to up to PLACES decimal places using DECIMAL as a decimal separator (e.g. 100/15,000 with PLACES=1 and DECIMAL=, is "0,7")`,
        regex: `(cgPerc)::(\\d*?)::(.*?)`,
        priority: STANDARD_THREE_PARAM_PRIORITY,
        transform: (x, match) =>
            rounded(
                (100 * x.ranking.codingame.rank) /
                    x.ranking.codingame.totalPlayers,
                +JSON.parse(match)[1]
            )
                .toString()
                .replace('.', JSON.parse(match)[2]),
    },
    cocPerc: {
        tag: 'cocPerc',
        description: `Clash of Code ranking as a percentile rounded to up to 2 decimal places`,
        regex: '(cocPerc)',
        priority: STANDARD_ONE_PARAM_PRIORITY,
        transform: (x) =>
            rounded(
                (100 * x.ranking.clashOfCode.rank) /
                    x.ranking.clashOfCode.totalPlayers,
                2
            ),
    },
    'cocPerc::PLACES': {
        tag: 'cocPerc::PLACES',
        description: `Clash of Code ranking as a percentile rounded to up to PLACES decimal places`,
        regex: '(cocPerc)::(.*?)',
        priority: STANDARD_TWO_PARAM_PRIORITY,
        transform: (x, match) =>
            rounded(
                (100 * x.ranking.clashOfCode.rank) /
                    x.ranking.clashOfCode.totalPlayers,
                +JSON.parse(match)[1]
            ),
    },
    'cocPerc::PLACES::DECIMAL': {
        tag: 'cocPerc::PLACES::DECIMAL',
        description: `Clash of Code ranking as a percentile rounded to up to PLACES decimal places using DECIMAL as a decimal separator`,
        regex: `(cocPerc)::(\\d*?)::(.*?)`,
        priority: STANDARD_THREE_PARAM_PRIORITY,
        transform: (x, match) =>
            rounded(
                (100 * x.ranking.clashOfCode.rank) /
                    x.ranking.clashOfCode.totalPlayers,
                +JSON.parse(match)[1]
            )
                .toString()
                .replace('.', JSON.parse(match)[2]),
    },
    'date::MOMENT_JS_DATE_STRING': {
        tag: 'date::MOMENT_JS_DATE_STRING',
        description: `Current date/time in your local timezone, using a moment.js date string. For example, {date::MMMM Do YYYY, h:mm:ss a} would yield "${moment().format(
            'MMMM Do YYYY, h:mm:ss a'
        )}"`,
        regex: `(date)::(.*?)`,
        priority: STANDARD_THREE_PARAM_PRIORITY,
        transform: (x, match) => moment().format(JSON.parse(match)[1]),
    },
};

export { tags };
