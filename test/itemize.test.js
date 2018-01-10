describe("itemize_me search example", () => {
    beforeEach(() => {
        fixture.setBase("test");
        fixture.load("search.fixture.html");
        window.Itemize.init();
    });

    afterEach(() => {
        fixture.cleanup();
    });

    it("should start with an empty search field", () => {
        expect($("#search-term").val()).toBe("");
    });

    it("should start with a disabled search button", () => {
        expect($("#search-button").prop("disabled")).toBe(true);
    });

    it("should start with a dropdown button which says ", () => {
        expect($("#dropdownMenuButton").text().trim()).toBe("Select Role");
    });

    describe("search button", () => {
        let searchTerm;
        let searchButton;
        const prefix = "#dropdown";
        const possibleRoles = ["ADC", "Support", "Mid", "Jungle", "Top"];

        beforeEach(() => {
            searchTerm = $("#search-term");
            searchButton = $("#search-button");
        });

        possibleRoles.forEach((role) => {
            it(`should be enabled when the search field is not blank, and the ${role} role is chosen`, () => {
                // Programmatic changes to elements do not trigger events on their own, so in unit tests
                // we need to trigger those programmatically as well.
                searchTerm.val("i can haz unit tests").trigger("input");
                $(prefix + role).trigger("click");
                expect(searchButton.prop("disabled")).toBe(false);
            });

            it(`should be disabled when the ${role} is chosen but searchField is blank`, () => {
                searchTerm.val("").trigger("input");
                $(prefix + role).trigger("click");
                expect(searchButton.prop("disabled")).toBe(true);
            });
        });

        it("should be disabled when the search field is blank and role not chosen", () => {
            searchTerm.val("").trigger("input");
            expect(searchButton.prop("disabled")).toBe(true);
        });

        it("should be disabled when the search field is not blank but role not chosen", () => {
            searchTerm.val("Jhin").trigger("input");
            expect(searchButton.prop("disabled")).toBe(true);
        });

        it("should be disabled when the search field is not blank but role chosen", () => {
            searchTerm.val("").trigger("input");
            $(prefix + "ADC").trigger("click");
            expect(searchButton.prop("disabled")).toBe(true);
        });
    });

    describe("Dropdown Menu Button", () => {
        let IDText = "#dropdown";

        let triggerDropDownButtonAndTest = function (role) {
            $(IDText + role).trigger("click");
            expect($("#dropdownMenuButton").text()).toBe(role);
        };

        it("should say ADC when the ADC role is selected", () => {
            triggerDropDownButtonAndTest("ADC");
        });

        it("should say Support when the Support role is selected", () => {
            triggerDropDownButtonAndTest("Support");
        });

        it("should say Mid when the Mid role is selected", () => {
            triggerDropDownButtonAndTest("Mid");
        });

        it("should say Jungle when the Jungle role is selected", () => {
            triggerDropDownButtonAndTest("Jungle");
        });

        it("should say Top when the Top role is selected", () => {
            triggerDropDownButtonAndTest("Top");
        });
    });

    describe("failed championAPI calls", () => {
        let request;
        beforeEach(()=>{
            jasmine.Ajax.install();
        });

        afterEach(() => {
            jasmine.Ajax.uninstall();
        });

        it("should say champion name does not exist when invalid champion name is given but role is picked", () => {
            const errorMessage = "Sorry, we've never heard of that champ! Please input a valid champion name and try again!";
            $("#search-term").val("thomas").trigger("input");
            $("#dropdownADC").trigger("click");
            $("#search-button").trigger("click");

            request = jasmine.Ajax.requests.mostRecent();
            request.respondWith({
                status: 200,
                responseText: JSON.stringify({
                    data: {
                        jhin: {
                            name: "Jhin"
                        }
                    }
                })
            });

            expect($("#errorMessage").text() === errorMessage).toBe(true);
        });

        it("should say invalid role given, when a champion name exists but not with the given role", () => {
            // jasmine.Ajax.requests is empty
            // so what gets called with jasmine.Ajax.requests.mostRecent()?
            // how to handle championJSON being requested
            let errorMessage = 'Sorry! ADC is not a valid role for Dondi. The valid role for Dondi is SUPPORT.';

            $("#search-term").val("Dondi").trigger("input");
            $("#dropdownADC").trigger("click");
            $("#search-button").trigger("click");

            request = jasmine.Ajax.requests.mostRecent();
            request.respondWith({
                status: 200,
                responseText: JSON.stringify({
                    data: {
                        Dondi: {
                            name: "Dondi",
                            key: "-370"
                        }
                    }
                })
            });


            request = jasmine.Ajax.requests.mostRecent();
            request.respondWith({
                status: 200,
                responseText: JSON.stringify([
                    {
                        winRate: 98,
                        hashes: {
                            finalitemshashfixed: {
                                highestCount: {
                                    hash: "first-3142-3009-3031-3094-3036-3026"
                                }
                            },
                            firstitemhash: {
                                highestCount: {
                                    hash: "items-3142-3009-3031-3094-3036-3026"
                                }
                            },
                        },
                        _id: {
                            role: "DUO_SUPPORT"
                        }

                    }
                ])
            });

            expect($("#errorMessage").text() === errorMessage).toBe(true);
        });
    });

    describe("successful champion API calls", () => {
        let request;
        let numberOfStartingItems = 2;
        let numberOfFinalItems = 6;

        beforeEach(() =>{
            jasmine.Ajax.install();
            $("#search-term").val("Dondi").trigger("input");
            $("#dropdownTop").trigger("click");
            $("#search-button").trigger("click");
            request = jasmine.Ajax.requests.mostRecent();
        });


        it("should respond with item set data when a correct response is queried", () => {

            $("#search-term").val("Dondi").trigger("input");
            $("#dropdownSupport").trigger("click");
            $("#search-button").trigger("click");
            request = jasmine.Ajax.requests.mostRecent();

            request.respondWith({
                status: 200,
                responseText: JSON.stringify({
                    data: {
                        Dondi: {
                            name: "Dondi",
                            key: "-370"
                        }
                    }
                })
            });

            request = jasmine.Ajax.requests.mostRecent();

            request.respondWith({
                status: 200,
                responseText: JSON.stringify([
                    {
                        winRate: 0.95,
                        hashes: {
                            finalitemshashfixed: {
                                highestCount: {
                                    hash: "item-3142-3009-3031-3094-3036-3026"
                                }
                            },
                            firstitemshash: {
                                highestCount: {
                                    hash: "first-3142-3009"
                                }
                            },
                        },
                        _id: {
                            role: "DUO_SUPPORT"
                        },
                        role: "DUO_SUPPORT"
                    }
                ])
            });

            request = jasmine.Ajax.requests.mostRecent();

            request.respondWith({
                status: 200,
                responseText: JSON.stringify({
                    data: {
                        3009: {name: "Pumping Lemur"},
                        3142: {name: "Teddy's Tissue"},
                        3031: {name: "Dorin's Secret Chamber"},
                        3094: {name: "Garen's Water"},
                        3036: {name: "Oil and Water"},
                        3026: {name: "Tanuki Hat"}
                    }
                })
            });

            request = jasmine.Ajax.requests.at(0);

            expect($("#h1Name").text()).toBe("Dondi SUPPORT");
            expect($("#h3WinRate").text()).toBe("Current Win Rate: 95%");
            // times 2 because a div is created with each img element
            expect($(".start-container").children().length).toBe(numberOfStartingItems * 2);
            expect($(".final-container").children().length).toBe(numberOfFinalItems * 2);

            // expect($(".image-result-container").children().length).toBe(1);
            // We can go even further by examining the resulting element(s) and expecting their content to match the
            // mock response, but we will leave this as "further work" for now.
        });

        afterEach(() => {
            jasmine.Ajax.uninstall();
        });
    });
});

describe("overall API calls", () => {
    let request;

    beforeEach(()=>{
        fixture.setBase("test");
        fixture.load("search.fixture.html");
        jasmine.Ajax.install();
        window.Itemize.init();
    });

    afterEach(()=>{
        jasmine.Ajax.uninstall();
        fixture.cleanup();
    });

    it("should populate the win rate table when page is loaded", () => {
        let url = 'http://localhost:3000/overall/?api_key=32be28e129c205dc540785fc0dd8f45f';
        let index;
        for (let i = 0; i < jasmine.Ajax.requests.count(); i++){
            if (jasmine.Ajax.requests.at(i).url === url) {
                index = i;
                break;
            }
        }

        request = jasmine.Ajax.requests.at(index);

        request.respondWith({
            status: 200,
            responseText: JSON.stringify([
                {
                    positions: {
                        MIDDLE: {
                            winrate: {
                                best: {score: 0.12, championId: -107},
                                worst: {score: 0.34, championId: -99}
                            }
                        },
                        TOP: {
                            winrate: {
                                best: {score: 0.56, championId: -107},
                                worst: {score: 0.78, championId: -99}
                            }
                        },
                        DUO_SUPPORT: {
                            winrate: {
                                best: {score: 0.99, championId: -108},
                                worst: {score: 0.88, championId: -99}
                            }
                        },
                        JUNGLE: {
                            winrate: {
                                best: {score: 0.77, championId: -108},
                                worst: {score: 0.66, championId: -99}
                            }
                        },
                        DUO_CARRY: {
                            winrate: {
                                best: {score: 0.55, championId: -107},
                                worst: {score: 0.44, championId: -99}
                            }
                        }
                    }
                }
            ])
        });

        url = '/static_data/champion.json';

        for (let i = 0; i < jasmine.Ajax.requests.count(); i++){
            if (jasmine.Ajax.requests.at(i).url === url) {
                index = i;
                break;
            }
        }

        request = jasmine.Ajax.requests.at(index);

        request.respondWith({
            status: 200,
            responseText: JSON.stringify({
                data: {
                    Dondi: {
                        name: "Dondi",
                        key: "-107"
                    },

                    Thomas: {
                        name: "Thomas",
                        key: "-108"
                    },

                    Worst: {
                        name: "Worst",
                        key: "-99"
                    }
                }
            })
        });

        const championImageURL = 'http://ddragon.leagueoflegends.com/cdn/7.21.1/img/champion/';

        expect($("#topBestImg").attr("src")).toBe(championImageURL + "Dondi" + ".png");
        expect($("#topWorseImg").attr("src")).toBe(championImageURL + "Worst" + ".png");
        expect($("#jungleBestImg").attr("src")).toBe(championImageURL + "Thomas" + ".png");
        expect($("#jungleWorseImg").attr("src")).toBe(championImageURL + "Worst" + ".png");
        expect($("#midBestImg").attr("src")).toBe(championImageURL + "Dondi" + ".png");
        expect($("#midWorseImg").attr("src")).toBe(championImageURL + "Worst" + ".png");
        expect($("#supportBestImg").attr("src")).toBe(championImageURL + "Thomas" + ".png");
        expect($("#supportWorseImg").attr("src")).toBe(championImageURL + "Worst" + ".png");
        expect($("#adcBestImg").attr("src")).toBe(championImageURL + "Dondi" + ".png");
        expect($("#adcWorseImg").attr("src")).toBe(championImageURL + "Worst" + ".png");

        expect($("#topWinName").text()).toBe("Dondi ");
        expect($("#topLoseName").text()).toBe("Worst ");
        expect($("#jungleWinName").text()).toBe("Thomas ");
        expect($("#jungleLoseName").text()).toBe("Worst ");
        expect($("#midWinName").text()).toBe("Dondi ");
        expect($("#midLoseName").text()).toBe("Worst ");
        expect($("#supportWinName").text()).toBe("Thomas ");
        expect($("#supportLoseName").text()).toBe("Worst ");
        expect($("#adcWinName").text()).toBe("Dondi ");
        expect($("#adcLoseName").text()).toBe("Worst ");

        expect($("#topBest").text()).toBe("56%");
        expect($("#topWorst").text()).toBe("78%");
        expect($("#jungleBest").text()).toBe("77%");
        expect($("#jungleWorst").text()).toBe("66%");
        expect($("#midBest").text()).toBe("12%");
        expect($("#midWorst").text()).toBe("34%");
        expect($("#supportBest").text()).toBe("99%");
        expect($("#supportWorst").text()).toBe("88%");
        expect($("#adcBest").text()).toBe("55%");
        expect($("#adcWorst").text()).toBe("44%");
    });
});


describe("generalAPI calls", () => {
    const url = 'http://localhost:3000/general/?api_key=32be28e129c205dc540785fc0dd8f45f';

    beforeEach(() => {
        fixture.setBase("test");
        fixture.load("search.fixture.html");
        jasmine.Ajax.install();
        window.Itemize.init();
    });

    afterEach(() => {
        jasmine.Ajax.uninstall();
        fixture.cleanup();
    });


    it("should populate the footer when the page is loaded", () => {
        let request;
        let index;

        for (let i = 0; i < jasmine.Ajax.requests.count(); i++){
            if (jasmine.Ajax.requests.at(i).url === url) {
                index = i;
                break;
            }
        }

        request = jasmine.Ajax.requests.at(index);

        request.respondWith({
            status: 200,
            responseText: JSON.stringify([
                {
                    patch: "370",
                    championCount: 9000000,
                    lastUpdate: "2019-05-05T15:35:35.53Z"
                }
            ])
        });

        expect($("#infoText").text()).toBe("9000000 Champions analyzed as of 2019-05-05 15:35:35.53");
        expect($("#patchText").text()).toBe("Patch 370");

    });
});
