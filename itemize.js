"use strict";

/* Credit to @dondi for providing some of the starter code.*/

// Yes, this is a "global." But it is a single entry point for all of the code in the module,
// and in its role as the overall controller code of the page, this is one of the acceptable
// uses for a [single!] top-level name.
//
// Module managers address even this issue, for web apps of sufficient complexity.
(() => {
    window.Itemize = {
        init: () => {
            const apiKey = "32be28e129c205dc540785fc0dd8f45f";

            const relayURL = "http://api.champion.gg/v2";

            const championAPI = `${relayURL}/champions/`;
            const imageURL = 'http://ddragon.leagueoflegends.com/cdn/7.21.1/img/item/';
            const championImageURL = 'http://ddragon.leagueoflegends.com/cdn/7.21.1/img/champion/';

            const overallAPI = `${relayURL}/overall/`;

            const generalAPI = `${relayURL}/general/`;

            const allRolesHash = {
                ADC: "DUO_CARRY",
                SUPPORT: "DUO_SUPPORT",
                MID: "MIDDLE",
                JUNGLE: "JUNGLE",
                TOP: "TOP"
            };

            let searchButton = $("#search-button");
            let searchTerm = $("#search-term");
            let resultContainer = $(".result-container");
            let dropdownMenuButton = $("#dropdownMenuButton");

            let inputReady = () => !searchTerm.val() || dropdownMenuButton.text().trim() === "Select Role";
            let disableSearchButtonUntilReady = () => searchButton.prop("disabled", inputReady());

            let appendErrorMsgToResultContainer = (message) => {
                resultContainer.empty().append(
                    $("<h2></h2>").attr({id: "errorMessage"}).text(message)
                );
            };

            $.getJSON(overallAPI, {api_key: apiKey}).done((result) => {
                let positionsQueryData = result[0].positions;
                $.getJSON("/itemize_me/static_data/champion.json").done(championJSON => {
                    let championHash = championJSON.data;
                    let idToChampionHash = {};

                    // initialize keys for hash
                    Object.keys(allRolesHash).forEach(role => {
                        let roleData = positionsQueryData[allRolesHash[role]];
                        let bestId = roleData.winrate.best.championId;
                        let worstId = roleData.winrate.worst.championId;
                        idToChampionHash[bestId + ""] = "";
                        idToChampionHash[worstId + ""] = "";
                    });

                    Object.keys(idToChampionHash).forEach(id => {
                        idToChampionHash[id + ""] = Object.keys(championHash).find((champName) => {
                            return championHash[champName].key === id;
                        });
                    });

                    Object.keys(allRolesHash).forEach((role) => {
                        let roleHashValue = allRolesHash[role];
                        let currentPositionData = positionsQueryData[roleHashValue];

                        let bestChampion = currentPositionData.winrate.best.championId;
                        let worstChampion = currentPositionData.winrate.worst.championId;

                        let bestWinRate = Math.floor(currentPositionData.winrate.best.score * 100);
                        let worstWinRate = Math.floor(currentPositionData.winrate.worst.score * 100);

                        let bestChampionName = idToChampionHash[bestChampion];
                        let worstChampionName = idToChampionHash[worstChampion];

                        let roleLowerCase = role.toLowerCase();

                        $(`#${roleLowerCase}BestImg`).attr({
                            src: `${championImageURL}${bestChampionName}.png`,
                            alt: `${bestChampionName}`
                        });

                        $(`#${roleLowerCase}WinName`).text(`${championHash[bestChampionName].name} `);

                        $(`#${roleLowerCase}Best`).text(`${bestWinRate}%`);

                        $(`#${roleLowerCase}WorseImg`).attr({
                            src: `${championImageURL}${idToChampionHash[worstChampion]}.png`,
                            alt: `${worstChampionName}`
                        });

                        $(`#${roleLowerCase}LoseName`).text(`${championHash[worstChampionName].name} `);

                        $(`#${roleLowerCase}Worst`).text(`${worstWinRate}%`);

                    });
                });

            });

            searchButton.click(() => {

                if (dropdownMenuButton.text().trim() === "Select Role") {
                    return;
                }

                resultContainer.empty().append($('<h1>Loading... Sit tight!</h1>'));

                $.getJSON("/itemize_me/static_data/champion.json").done(championJSON => {
                    let championHash = championJSON.data;
                    let inputForHash = searchTerm.val().toLowerCase().replace(/ /g, '');
                    let formattedInput = searchTerm.val().charAt(0).toUpperCase() +
                        inputForHash.slice(1);
                    let championKey = Object.keys(championHash).find((championKey)=> {
                        return championHash[championKey].name.toLowerCase().replace(/ /g, '') ===
                        inputForHash;
                    });

                    // user did not type a valid champion name, try again!
                    if (!championKey) {
                        let errorMessage = "Sorry, we've never heard of that champ! " +
                            "Please input a valid champion name and try again!";

                        appendErrorMsgToResultContainer(errorMessage);
                        return;
                    }

                    const id = championHash[championKey].key;
                    const championName = championHash[championKey].name;

                    $.getJSON(championAPI + id, {
                        champData: "hashes",
                        api_key: apiKey,

                    }).done(result => {
                        // first we check if we found a compatible combination, if not
                        // let user know invalid champion + role, then show avaliable roles

                        let userInputtedRole = dropdownMenuButton.text().toUpperCase();
                        let correctedUserInputRole = allRolesHash[dropdownMenuButton.text().toUpperCase()];
                        let isValidRole = false;
                        let validRoles = [];

                        validRoles = result.map(champData => champData._id.role);

                        isValidRole = validRoles.some(validRole => validRole === correctedUserInputRole);

                        if (!isValidRole) {
                            let textCorrectedRoles = validRoles.map((role) => {
                                if (role === 'DUO_CARRY') {
                                    return 'ADC';
                                }

                                if (role === 'DUO_SUPPORT') {
                                    return 'Support';
                                }

                                return role;
                            });

                            textCorrectedRoles = textCorrectedRoles.map((role) => {
                                return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase().trim();
                            });

                            let areOrIs = validRoles.length > 1 ? 'are' : 'is';
                            let roleOrRoles = validRoles.length > 1 ? 'roles' : 'role';


                            let errorMessage = `Sorry! ${userInputtedRole} is not a valid role for ` +
                                                `${championName}. The valid ${roleOrRoles} for ${formattedInput} ` +
                                                `${areOrIs} ${textCorrectedRoles.join(', ').toUpperCase()}.`;

                            appendErrorMsgToResultContainer(errorMessage);
                            return;
                        }

                        // if we got here, the user has given a successful
                        // champion name and role combination
                        const queryData = result.find((roleData) => roleData.role === correctedUserInputRole);
                        const winRate = Math.floor(queryData.winRate * 100);
                        const winRateText = `Current Win Rate: ${winRate}%`;

                        const startingItemHash = queryData.hashes.firstitemshash.highestCount.hash;
                        const finalItemHash = queryData.hashes.finalitemshashfixed.highestCount.hash;

                        const prefixLength = 6;
                        const startingItemHashArray = startingItemHash.slice(prefixLength).split('-');
                        const finalItemHashArray = finalItemHash.slice(prefixLength).split('-');
                        const startingBuildText = 'Most Popular Starting Build';
                        const finalBuildText = 'Most Popular Final Build';

                        resultContainer.empty().append(
                            $('<div></div>').addClass('card').attr({style: "width:100%", id: "itemCard"}).append(
                                $('<div></div>').addClass('card-body').attr({id: "itemBody"}).append([
                                    $('<h1></h1>').attr({id: "h1Name"}).text(`${championName} ${userInputtedRole}`),
                                    $('<hr>'),
                                    $('<h3></h3>').attr({id: "h3WinRate"}).text(winRateText),

                                    $('<br>'),

                                    $('<div></div>').addClass('card').append(
                                        $(`<h4>${startingBuildText}</h4>`).addClass('card-header'),
                                        $('<div></div>').addClass('card-body').append(
                                            $('<div></div>').addClass('row justify-content-center start-container')
                                        )
                                    ),

                                    $('<br>'),

                                    $('<div></div>').addClass('card').append(
                                        $(`<h4>${finalBuildText}</h4>`).addClass('card-header'),
                                        $('<div></div>').addClass('card-body').append(
                                            $('<div></div>').addClass('row justify-content-center final-container')
                                        )
                                    )
                                ])
                            )
                        );

                        const startingItemContainer = $('.start-container');
                        const finalItemContainer = $('.final-container');

                        $.getJSON('/itemize_me/static_data/item.json').done((itemJSON) => {
                            let itemHash = itemJSON.data;
                            startingItemContainer.empty().append(
                                startingItemHashArray.map(item =>
                                    $('<div></div>').addClass('col-1').append(
                                        $("<img/>").attr({ src: `${imageURL + item}.png`, alt: itemHash[item]})
                                    )
                                )
                            );

                            finalItemContainer.empty().append(
                                finalItemHashArray.map(item =>
                                    $('<div></div>').addClass('col-1').append(
                                        $("<img/>").attr({ src: `${imageURL + item}.png`, alt: itemHash[item]})
                                    )
                                )
                            );
                        });
                    });
                });
            });

            $.getJSON(generalAPI, {api_key: apiKey}).done((result)=>{
                const overallData = result[0];

                const patch = overallData.patch;
                const lastUpdate = overallData.lastUpdate.replace('T', ' ').replace('Z', '');
                const championCount = overallData.championCount;

                const leftFooterMessage = `${championCount} Champions analyzed as of ${lastUpdate}`;
                const rightFooterMessage = `Patch ${patch}`;

                $('#infoText').text(leftFooterMessage);
                $('#patchText').text(rightFooterMessage);
            });

            searchTerm.bind("input", disableSearchButtonUntilReady);

            let changeDropdownMenuOnClick = function () {
                this.onclick = function () {
                    dropdownMenuButton.text(this.text);
                    disableSearchButtonUntilReady();
                };
            };

            $(".dropdown-item.champ-role-selector").each(changeDropdownMenuOnClick);
            $(".dropdown-item.champ-role-selector").each(changeDropdownMenuOnClick);
        }
    };
})();
