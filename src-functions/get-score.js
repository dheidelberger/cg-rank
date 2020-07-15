const axios = require('axios');
const middy = require('@middy/core');
const createError = require('http-errors');
const httpSecurityHeaders = require('@middy/http-security-headers');
const httpErrorHandler = require('@middy/http-error-handler');

/**Make API call to get the handle from the username
 * Sample handle: 9fc0551433d1b5bd380b6b4e47a56d2c7830083
 * API endpoint: POST: https://www.codingame.com/services/search/search
 * Body must be: ["[PROFILE]","en",null]
 *
 * @async
 * @function getProfileHandle
 * @param {string} profile - User's profile name
 * @returns {Object} The first result from the API call {type='USER', name, id, [imageBinaryId]}
 */
async function getProfileHandle(profile) {
    const data = `["${profile}","en",null]`;

    const profileIdConfig = {
        method: 'post',
        url: 'https://www.codingame.com/services/search/search',
        headers: {
            'Content-Type': 'text/plain',
        },
        data: data,
    };

    let res;
    try {
        res = await axios(profileIdConfig);
    } catch (err) {
        console.log('ERRORED!');
        console.log(err);
        throw new createError(
            err.response.status,
            `Error fetching profile handle: ${err.response.data.message}`
        );
    }

    //We get an array of objects back based on matches
    //Seems to return only exact or partial matches
    //Only seen 'USER' matches so far, but filter for that anyway and take the first match
    //Interesting fields here:
    //   type - user type
    //   name - username
    //   id - the long handle id for the next step
    //   imageBinaryId - If the user has a profile pic, this is used in the link to it
    let results = res.data;
    results = results.filter((x) => x.type === 'USER');

    if (results.length > 0) {
        let bestUser = results[0];
        if (bestUser.name.toLowerCase() !== profile.toLowerCase()) {
            throw new createError(500, `Could not find user: ${profile}`);
        }
        return bestUser;
    } else {
        throw new createError(500, `Could not find user: ${profile}`);
    }
}

/**Once we have the handle, we must make a second API call to get the actual user id
 * Sample id: 3800387
 * API endpoint: POST: https://www.codingame.com/services/CodinGamer/findCodingamePointsStatsByHandle
 * Body must be: ["[HANDLE]"]
 *
 * @async
 * @function getProfileId
 * @param {string} profileHandle - User's profile handle
 * @returns {Object} The user's id and their overall CG rank: {id, rank}
 */
async function getProfileId(profileHandle) {
    const data = `["${profileHandle}"]`;

    const profileIdConfig = {
        method: 'post',
        url:
            'https://www.codingame.com/services/CodinGamer/findCodingamePointsStatsByHandle',
        headers: {
            'Content-Type': 'text/plain',
        },
        data: data,
    };
    let res;
    try {
        res = await axios(profileIdConfig);
        let resData = res.data;

        //Lots of data comes back from this call
        //Fields of interest:
        //   codingamer.userId - the actual ID we need, look like: 3800387
        //   codingamer.rank - backup rank we can use if the next call is null
        //Also has ranking histories and lists of points in each game category
        //Does not have information about the total number of players,
        // so we can't use this as our primary ranking data
        let id = `${resData.codingamer.userId}`;
        let rank = resData.codingamer.rank;

        return { id, rank };
    } catch (err) {
        console.log('ERRORED!');
        console.log(err);
        throw new createError(
            err.response.status,
            `Error fetching profile ID: ${err.response.data.message}`
        );
    }
}

/**Once we have the ID, we make a final call to get the CG and Clash ranks
 * API endpoint: POST: https://www.codingame.com/services/CodinGamer/findRankingPoints
 * Body must be: ["[ID]"]
 *
 * @async
 * @function getHighScore
 * @param {string} profileId - User's profile ID
 * @returns {Object} The user's ranking and overall number of players {codingame:{rank,totalPlayers},clashOfCode:{rank,totalPlayers}}. Rank and totalPlayers will be 'Unranked' and 'Unknown' respectively if the API returns null.
 */
async function getHighScore(profileId) {
    const data = `["${profileId}"]`;
    // const data = 'howdy';

    const highScoreConfig = {
        method: 'post',
        url: 'https://www.codingame.com/services/CodinGamer/findRankingPoints',
        headers: {
            'Content-Type': 'text/plain',
        },
        data: data,
    };
    let res;
    try {
        res = await axios(highScoreConfig);
        let resData = res.data;
        let ranking = {
            codingame: {
                rank: 'Unranked',
                totalPlayers: 'Unknown',
            },
            clashOfCode: {
                rank: 'Unranked',
                totalPlayers: 'Unknown',
            },
        };

        //New players seem to return null here. Check for that so we don't error and then
        //return the default object above
        if (resData !== null) {
            ranking = {
                codingame: {
                    rank: resData.globalPointsRankGlobal,
                    totalPlayers: resData.totalCodingamerGlobal.global,
                },
                clashOfCode: {
                    rank: resData.clashPointsRankGlobal,
                    totalPlayers: resData.totalCodingamerGlobal.clash,
                },
            };
        }

        return ranking;
    } catch (err) {
        console.log('ERRORED!');
        console.log(err);
        throw new createError(
            err.response.status,
            `Error fetching profile ID: ${err.response.data.message}`
        );
    }
}

/**Primary function endpoint
 * @async
 * @function getScore
 * @param {string} profile - Should be in the query string
 * @returns {Object} {handle,name,id,avatar,ranking:{codingame:{rank,totalPlayers},clashOfCode:{rank,totalPlayers}}}
 */
const getScore = async (event, context) => {
    const profile = event.queryStringParameters['profile'];

    //Profile is required
    if (!profile) {
        throw new createError.UnprocessableEntity();
    }

    //We will return this
    let out = {};

    //Must make 3 API calls:
    //Get a long "handle" from a username
    const user = await getProfileHandle(profile);

    //Get a shorter id from the handle
    const profileId = await getProfileId(user.id);

    //Get rankings from the id
    const ranking = await getHighScore(profileId.id);

    //Very new users seem not to have rankings from the ranking API call
    //We can get their overall rank from the ID API call, though
    if (ranking.codingame.rank === 'Unranked') {
        ranking.codingame.rank = profileId.rank;
    }

    out.handle = user.id;
    out.name = user.name;
    out.id = profileId.id;
    out.ranking = ranking;
    if (user.imageBinaryId) {
        out.avatar = `${user.imageBinaryId}`;
    }

    console.log(out);

    return {
        statusCode: 200,
        body: JSON.stringify(out),
    };
};

const handler = middy(getScore);

handler.use(httpErrorHandler(), httpSecurityHeaders());

exports.handler = handler;
