(function( $ ) {

    var categories = {
        1: {name: "do 10 let"},
        2: {name: "10-15 let"},
        3: {name: "nad 15 let"}
    };

    var blocks = {
        1: {time: "13:45 - 14:15", run: false},
        2: {time: "14:15 - 14:45", run: false},
        3: {time: "14:45 - 15:15", run: false},
        4: {time: "15:15 - 15:45", run: false},
        5: {time: "15:45 - 16:15", run: false},
        6: {time: "16:15 - 16:45", run: false},
        7: {time: "16:45 - 17:15", run: false}
    };
    var numBlocks = 7;

    var playgrounds = {
        1: {name: "Vybika/přehazka", usedInBlock: false},
        2: {name: "Fotbal", usedInBlock: false},
        3: {name: "Frisbee", usedInBlock: false}
    };
    var numPlaygrounds = 3;

    var teams = [];

    /*var teams = [
        {cat :4, teams: {
            1: {name: "vC", usedInBlock: false, matches: 0, lastBlockPlayed: null, lastPlayGround: null, pgCount: {}, blackCard: false},
            2: {name: "vD", usedInBlock: false, matches: 0, lastBlockPlayed: null, lastPlayGround: null, pgCount: {}, blackCard: false},
            3: {name: "vE", usedInBlock: false, matches: 0, lastBlockPlayed: null, lastPlayGround: null, pgCount: {}, blackCard: false},
            4: {name: "vH", usedInBlock: false, matches: 0, lastBlockPlayed: null, lastPlayGround: null, pgCount: {}, blackCard: false},
            5: {name: "vI", usedInBlock: false, matches: 0, lastBlockPlayed: null, lastPlayGround: null, pgCount: {}, blackCard: false},
            //6: {name: "vK", usedInBlock: false, matches: 0, lastBlockPlayed: null, lastPlayGround: null, pgCount: {}, blackCard: false}
        }},
        {cat :1, teams: {
            1: {name: "mA", usedInBlock: false, matches: 0, lastBlockPlayed: null, lastPlayGround: null, pgCount: {}, blackCard: false},
            2: {name: "mB", usedInBlock: false, matches: 0, lastBlockPlayed: null, lastPlayGround: null, pgCount: {}, blackCard: false},
            3: {name: "mF", usedInBlock: false, matches: 0, lastBlockPlayed: null, lastPlayGround: null, pgCount: {}, blackCard: false},
            4: {name: "mG", usedInBlock: false, matches: 0, lastBlockPlayed: null, lastPlayGround: null, pgCount: {}, blackCard: false},
            5: {name: "mJ", usedInBlock: false, matches: 0, lastBlockPlayed: null, lastPlayGround: null, pgCount: {}, blackCard: false}
        }},
        /*{cat :2, teams: {
            1: {name: "sF", usedInBlock: false, matches: 0, lastBlockPlayed: null, lastPlayGround: null, pgCount: {}, blackCard: false},
            2: {name: "sG", usedInBlock: false, matches: 0, lastBlockPlayed: null, lastPlayGround: null, pgCount: {}, blackCard: false}
        }}
    ];*/

    // how many times team played with another team - indexed by category and then by teamIds
    var teamMatches = {};

    // result is indexed by block and playground
    var result = {};

    $(document).ready(function(){

        checkAndLoadSavedTeams();

        initMenu();
        showTeams();
        initTeams();

        //fillTable();
        //drawTable();

        $("#genButton").click(function(){

            fillTable();

            $(".matchTable").show().find("tr:visible").remove();
            $(".countTables").show().html("");
            $(".kdoSKym").show();

            drawTable();
        });

        $(window).scrollTop(0);
    });


    function initMenu(){
        $(".menu a:first").addClass("active");
        $(".tab:first").show();

        $(".menu a").on("click", function(e){
            $(".menu a").removeClass("active");
            $(".tab").hide();
            $(e.target).addClass("active");
            $($(e.target).attr("href")).show();

            if($(e.target).hasClass("info")){
                showTeams();
            }
            if($(e.target).hasClass("table")){
                if(teams.length > 0){
                    hidePlaceholder();
                }else{
                    showPlaceholder();
                }
            }
        });
    }

    function hidePlaceholder(){
        $("#genButtonCont").show();
        $("#placeholder").hide();
    }

    function showPlaceholder(){
        $("#genButtonCont").hide();
        $("#placeholder").show();
    }

    function showTeams(){
        var table = $(".teamList");
        var template = table.find(".template");
        table.find("tr:not(.template)").remove();
        $.each(teams, function(i, catData){
            $.each(catData.teams, function(j, teamData){
                var ourRow = template.clone().removeClass("template").show();
                ourRow.find(".catRow").html(categories[catData.cat].name);
                ourRow.find(".nameRow").html(teamData.name);
                table.append(ourRow);
            });
        });

        if(teams.length === 0){
            table.append("<tr><td>Žádné týmy. Nejprve je zadejte.</td><tr>")
        }
    }

    function initTeams(){
        $("#newTeamButton").click(function(){
            addTeamRow();
        });

        $("#saveTeamsButton").click(function(){
            saveTeams();
            alert("Uloženo.");
        });

        if(teams.length === 0) {
            addTeamRow();
            addTeamRow();
            addTeamRow();
        } else {
            $.each(teams, function(catId, catData){
                $.each(catData.teams, function(teamId, teamData){
                    addTeamRow(catData.cat, teamData);
                });
            });
        }
    }

    function checkAndLoadSavedTeams(){
        var savedTeams = localStorage["teams"];
        if (typeof savedTeams !== "undefined") {
            teams = JSON.parse(savedTeams);
            console.log("Teams loaded", teams);
            hidePlaceholder();

            $("#savedTeamsPresent").show();
            $("#clearTeamsButton").click(function(){
                var ok = confirm("Opravdu smazat týmy z lokálního úložiště?");
                if (ok === true) {
                    localStorage.clear();
                    showPlaceholder();
                    teams = [];
                    $("#savedTeamsPresent").hide();
                }
            });
        }
    }

    function saveTeams(){

        teams = [];

        $(".teamsTable .teamRow:visible").each(function(i, teamRow){
            var teamName = $(teamRow).find(".teamName").val();
            var teamCat = parseInt($(teamRow).find(".teamCatSelect option:selected").val());
            if(teamName === ""){
                return true; // continue
            }

            var catFound = false;
            $.each(teams, function(i, catData){
                if(catData.cat === teamCat){
                    teams[i].teams[getTeamId(teamCat)] = createTeam(teamName);
                    catFound = true;
                    return false; // break
                }
            });
            if(catFound === false){
                teams.push({
                    cat: teamCat,
                    teams: {1: createTeam(teamName)}
                });
            }
        });

        localStorage.setItem("teams", JSON.stringify(teams));

        console.log("saved", teams);
    }

    function createTeam(name){
        return {
            name: name,
            usedInBlock: false,
            matches: 0,
            lastBlockPlayed: null,
            lastPlayGround: null,
            pgCount: {}
        };
    }

    function getTeamId(teamCat){
        var newId = 1;
        $.each(teams, function(i, catData){
            if(catData.cat === teamCat){
                $.each(catData.teams, function(i, teamData){
                    newId++;
                });
            }
        });

        return newId;
    }

    function addTeamRow(editedCatId, teamData){
        var teamTable = $(".teamsTable")
        var newTeamRow = teamTable.find(".template").clone().removeClass("template").show();
        var catSelect = newTeamRow.find(".teamCatSelect");
        $.each(categories, function (catId, catData){
            var isSelected = (parseInt(editedCatId) === parseInt(catId));
            catSelect.append($("<option value='"+catId+"' "+(isSelected? "selected":"")+">"+catData.name+"</option>"));
        });
        newTeamRow.find(".removeRowButton").click(function(e){
            var teamRow = $(e.target).closest("tr");
            var teamName = teamRow.find(".teamName").val();
            if(teamName === ""){
                teamRow.remove();
                return;
            }

            var really = confirm("Opravdu odstranit tým "+teamName+" ?");
            if(really === true){
                teamRow.remove();
            }
        });
        if(typeof teamData !== "undefined"){
            newTeamRow.find(".teamName").val(teamData.name);
        }
        teamTable.append(newTeamRow);
    }

    function fillTable(){
        $("#notFoundMsg").hide();

        var failedTeams = 0; // counter of teams which have 0 matches on any playground
        var counter = 0;    // infinite cycle stopper
        do {
            console.log("Trying to fill table, try "+counter+".");
            tryFillTable();

            $.each(teams, function(catId, catData){
                $.each(catData.teams, function(teamId, teamData){
                    $.each(playgrounds, function(pgId, pgData){
                        if (typeof teamData.pgCount[pgId] === "undefined") {
                            failedTeams++;
                        }
                    });
                });
            });
            counter++;

        } while(failedTeams > 0 && counter < 1000);

        if (failedTeams > 0) {
            $("#notFoundMsg").show();
        }
    }

    function tryFillTable(){

        console.log("filling using", teams);

        result = {};
        teamMatches = {};
        $.each(teams, function(i, catData){
            $.each(catData.teams, function(j, teamData){
                teams[i].teams[j].matches = 0;
                teams[i].teams[j].lastBlockPlayed = null;
                teams[i].teams[j].lastPlayGround = null;
                teams[i].teams[j].pgCount = {};
            });
        });

        // sort by count of teams first - descending
        sortTeams(true);

        var lessCatsThanPlaygrounds = teams.length < numPlaygrounds;

        // for each time block
        $.each(blocks, function(blockId, blockData){

            $.each(teams, function(i, teamData){

                // if this category has 2 teams only and it played last block, they can take a break
                var blockNumId = parseInt(blockId);
                if(getTeamCount(teamData.teams) === 2 && (catPlayedLastBlock(blockNumId, teamData.cat))){
                    return true; // continue with next cat
                }

                // if there are more playgrounds than categories, allow category to be processed twice
                if(lessCatsThanPlaygrounds === true){
                    $.each([1,2], function (i) {
                        processCat(blockId, blockData, teamData);
                    });
                }else{
                    processCat(blockId, blockData, teamData);
                }
            });

            // are there any empty slots in this block? try to fill them with first category again
            if(hasEmptySlots(blockId) && blockId !== numBlocks){
                fillEmptySlots(blockId);
            }

            console.log("--- next block ---");

            // and reset
            resetUsedFlag();
            teams.reverse(); // reverse order for cats on each block to be more fair
        });

        console.log("together", teamMatches);
    }

    function hasEmptySlots(blockId){
        var numMatches = 0;
        $.each(result[blockId], function(i, teams){
            numMatches++;
        });
        return numMatches < numPlaygrounds;
    }

    function fillEmptySlots(blockId){

        $.each(playgrounds, function(pgId, pgData){
            if(typeof result[blockId] !== "undefined" && typeof result[blockId][pgId] === "undefined"){
                // get first cat that has more than 2 teams
                $.each(teams, function(i, catData){
                    if(getTeamCount(catData.teams) > 2){
                        var result = processCat(blockId, [], catData);
                        if(result === true){
                            return false; // break
                        }
                    }
                });
            }
        });
    }

    function catPlayedLastBlock(blockId, catId){
        var catPlayed = false;
        $.each(result[blockId-1], function(i, teams){
            if(teams[0].catId === catId){
                catPlayed = true;
                return false; // break
            }
        });

        return catPlayed;
    }

    function processCat(blockId, blockData, teamData){
        // if this is last block and all teams have same count of matches, do not continue for this category if category has more than 2 teams
        if(parseInt(blockId) === numBlocks && getTeamCount(teamData.teams) > 2 && sameMatchCountInCategory(teamData.teams)){
            return false;
        }

        var matchTeams = getMatchTeams(teamData.cat, teamData.teams, blockId);
        console.log("Teams found in cat "+teamData.cat, matchTeams);
        // teams found for match - save them
        if(matchTeams !== null){

            // is there free playground in this block
            var playground = getFreePlayground(matchTeams);
            console.log("Playground found for cat "+teamData.cat+":", playground);
            if(playground === null){
                return false; // no playground free? continue
            }

            // now set playground and teams as used
            setTeamsPlayedTogether(teamData.cat, matchTeams);
            setPlaygroundUsed(playground.id);
            $.each(matchTeams, function(i, matchTeam){
                setTeamUsed(matchTeam.catId, matchTeam.teamId, blockId, playground.id);
            });

            if(typeof result[blockId] === "undefined"){
                result[blockId] = {};
            }
            if(typeof result[blockId][playground.id] === "undefined"){
                result[blockId][playground.id] = matchTeams;
            }

            return true;
        }

        return false;
    }

    function sameMatchCountInCategory(catTeams){
        var same = false;
        var lastCount = null;
        $.each(catTeams, function(i, teamData){
            if(lastCount === null){
                same = true;
                lastCount = teamData.matches;
            }else if(lastCount !== teamData.matches){
                same = false;
                return false; // break
            }
        });
        return same;
    }

    function getFreePlayground(matchTeams){
        var pgsFound = [];
        $.each(playgrounds, function(pgId, pgData){
            if(pgData.usedInBlock === false){
                pgsFound.push({
                    id: pgId,
                    rank: getPlaygroundRank(pgId, matchTeams)
                });
            }
        });

        // order found playgrounds by rank
        pgsFound.sort(function(a, b){ return a.rank > b.rank ? 1 : (a.rank < b.rank ? -1 : 0); });

        // take last playground or null if no playground found
        return pgsFound.length === 0 ? null : pgsFound.pop();
    }

    function getPlaygroundRank(pgId, matchTeams){
        var rank = 1;
        var numLast = 0;

        // how many from match teams had this playground as last playground?
        $.each(matchTeams, function(i, mTeamData){
            if(mTeamData.data.lastPlayGround === pgId){
                numLast += 1;
            }
            if(typeof mTeamData.data.pgCount[pgId] !== "undefined"){
                rank -= mTeamData.data.pgCount[pgId];
            }
        });

        switch(numLast){
            case 2: rank+=1; break;
            case 1: rank+=3; break;
            case 0: rank+=6; break;
        }

        return rank;
    }

    function setPlaygroundUsed(pgId){
        playgrounds[pgId].usedInBlock = true;
    }

    function setTeamUsed(catId, teamId, blockId, pgId){
        var team = teams.filter(function(tData){ return tData.cat === catId; }).pop().teams[teamId];
        team.usedInBlock = true;
        team.lastBlockPlayed = parseInt(blockId);
        team.matches += 1;
        team.lastPlayGround = pgId;
        if(typeof team.pgCount[pgId] === "undefined"){
            team.pgCount[pgId] = 1;
        }else{
            team.pgCount[pgId] += 1;
        }
    }

    function setTeamsPlayedTogether(catId, teams){
        console.log("setting as played together in category "+ catId, teams)
        if(typeof teamMatches[catId] === "undefined"){
            teamMatches[catId] = {};
        }
        var team1Id = teams[0].teamId;
        var team2Id = teams[1].teamId;
        if(typeof teamMatches[catId][team1Id] === "undefined"){
            teamMatches[catId][team1Id] = {};
            teamMatches[catId][team1Id][team2Id] = 0;
        }
        if(typeof teamMatches[catId][team2Id] === "undefined"){
            teamMatches[catId][team2Id] = {};
            teamMatches[catId][team2Id][team1Id] = 0;
        }
        if(typeof teamMatches[catId][team1Id][team2Id] === "undefined"){
            teamMatches[catId][team1Id][team2Id] = 0;
        }
        if(typeof teamMatches[catId][team2Id][team1Id] === "undefined"){
            teamMatches[catId][team2Id][team1Id] = 0;
        }

        teamMatches[catId][team1Id][team2Id] += 1;
        teamMatches[catId][team2Id][team1Id] += 1;
    }

    function getMatchTeams(catId, catTeams, blockId){
        var teamsFound = [];
        $.each(catTeams, function(teamId, teamData){
            if(teamData.usedInBlock === false){
                teamsFound.push({
                    catId: catId,
                    teamId: teamId,
                    data: teamData,
                    rank: getTeamRank(teamData, teamId)
                });
            }
        });

        // if there are less than 2 teams, cannot continue, return
        if(teamsFound.length < 2){
            return null;
        }

        // order found teams by rank descending
        teamsFound.sort(function(a, b){ return a.rank < b.rank ? 1 : (a.rank > b.rank ? -1 : 0); });

        // and pick first team
        var firstTeam = pickTeam(teamsFound);
        teamsFound = removeTeam(teamsFound, firstTeam);

        // and now find next team by rank and match table
        $.each(teamsFound, function(i, teamData){
            teamsFound[i].rank = getTeamRank(teamData.data, teamData.teamId, firstTeam)
        });

        // sort the rest again
        teamsFound.sort(function(a, b){ return a.rank < b.rank ? 1 : (a.rank > b.rank ? -1 : 0); });

        // and pick first team along with the previously selected
        return [firstTeam, pickTeam(teamsFound)];
    }

    function pickTeam(teamsFound){
        // get all the teams with highest rank
        var topTeams = [];
        var topRank = teamsFound[0].rank;
        $.each(teamsFound, function(i, teamData){
            if(topRank === teamData.rank){
                topTeams.push(teamData);
            }
        });

        // if there is more than one team with bigger score, shuffle the array randomly
        if(topTeams.length > 1){
            topTeams = shuffleArray(topTeams);
        }

        // and now pick the first team from resulting array
        return topTeams.shift();
    }

    function removeTeam(teamsFound, team){
        // and remove it from original array
        $.each(teamsFound, function(i, teamData){
            if(teamData.teamId === team.teamId){
                teamsFound.splice(i, 1);
                return false; // break
            }
        });

        return teamsFound;
    }

    function shuffleArray(array) {
        var currentIndex = array.length, temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    }

    function getTeamRank(teamData, teamId, firstTeam){
        var rank = 15;

        // the less matches team had, the bigger rank it should have
        rank -= teamData.matches*2;

        // if match against team is required, look into team matches table
        if(typeof  firstTeam !== "undefined"
            && !$.isEmptyObject(teamMatches)
            && typeof teamMatches[firstTeam.catId] !== "undefined"
            && typeof teamMatches[firstTeam.catId][teamId] !== "undefined"
            && typeof teamMatches[firstTeam.catId][teamId][firstTeam.teamId] !== "undefined"
        ){
            rank -= teamMatches[firstTeam.catId][teamId][firstTeam.teamId];
        }

        return rank;
    }

    function resetUsedFlag(){
        $.each(playgrounds, function(pgId, pgData){
            playgrounds[pgId].usedInBlock = false;
        });
        $.each(teams, function(catId, catData){
            $.each(catData.teams, function(teamId, teamData){
                teams[catId].teams[teamId].usedInBlock = false;
            });
        });
    }

    function sortTeams(desc){
        var more = 1;
        var less = -1;
        if(desc === true){
            more = -1;
            less = 1;
        }

        teams.sort(function(a, b){
            var lenA = getTeamCount(a.teams);
            var lenB = getTeamCount(b.teams);
            return lenA > lenB ? less : (lenA < lenB ? more : 0);
        });
    }

    function getTeamCount(teamsArr){
        var count = 0;
        $.each(teamsArr, function(){
            count += 1;
        });
        return count;
    }

    function drawTable(){
        var matchTable = $(".matchTable");
        var row = $("<tr><th>&nbsp;</th></tr>");
        $.each(blocks, function(blockId, blockData){
            drawCell(row, blockData.time, true);
        });
        matchTable.append(row);

        $.each(playgrounds, function(pgId, plgData){
            var row = $("<tr><th>"+plgData.name+"</th></tr>");
            $.each(blocks, function(blockId, blockData){
                drawCell(row, drawCellData(blockId, pgId), false);
            });
            matchTable.append(row);
        });

        var countTable = $(".countTables");
        $.each(teams, function(i, catData){
            countTable.append($("<p style='font-weight: bold; font-size: 12px;'>Kategorie "+categories[catData.cat].name+"</p>"));
            var theTable = $("<table border='1'></table>");
            var firstRow = $("<tr><th>&nbsp;</th></tr>");
            $.each(catData.teams, function(team1Id, teamData){
                firstRow.append("<th>"+teamData.name+"</th>");
            });
            firstRow.append($("<th>zápasů</th>"));
            $.each(playgrounds, function(pgId, pgData){
                firstRow.append($("<th>"+pgData.name+"</th>"));
            });
            theTable.append(firstRow);
            $.each(catData.teams, function(team1Id, teamData){
                var theRow = $("<tr><th>"+teamData.name+"</th></tr>");
                $.each(catData.teams, function(team2Id, teamData2){
                    var count = teamMatches[catData.cat][team1Id][team2Id];
                    theRow.append($("<td "+(team1Id===team2Id ? "style='background-color: #ccc;'" : "")+">"+(typeof count === "undefined" ? "--" : count)+"</td>"));
                });
                theRow.append($("<td>"+teamData.matches+"</td>"));
                $.each(playgrounds, function(pgId, pgData){
                    var playCount = teamData.pgCount[pgId];
                    theRow.append($("<th "+(typeof playCount == "undefined" ? "style=\"color:red;\"":"")+">"+(typeof playCount == "undefined" ? 0 : playCount)+"</th>"));
                });
                theTable.append(theRow);
            });

            countTable.append(theTable);
        });

    }

    function drawCell(row, text, heading){
        var cell = $(heading === true ? "<th>":"<td>");
        row.append(cell);
        cell.text(text);
    }

    function drawCellData(blockId, pgId){
        var cellData = getCellData(blockId, pgId);
        if(cellData === null){
            return "--";
        }
        
        return cellData[0].data.name + " / " + cellData[1].data.name;
    }

    function getCellData(blockId, pgId){
        if(typeof result[blockId] === "undefined"){
            return null;
        }
        if(typeof result[blockId][pgId] === "undefined"){
            return null;
        }
        return result[blockId][pgId];
    }


})( jQuery );
