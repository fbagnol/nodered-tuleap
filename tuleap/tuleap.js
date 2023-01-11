module.exports = function(RED) {




    function TuleapArtefactSearchNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var query = config.query;
        var id = config.id;
        var server = RED.nodes.getNode(config.server);


        this.on('input', function(msg) {
            this.log("Performing search '" + query + "'");
            node.perform(query, function(artefact, index, array) {
                var msg = {};
                msg.topic = "?";
                msg.payload = artefact;
                node.send(msg);

            });
        });

        this.perform = function(query, callback, startIndex = 0) {

            var options = {
                "startAt": startIndex,
            };
            var rqcallback = function(errors, response, body) {
                if (errors) {
                    node.status({
                        fill: "red",
                        shape: "dot",
                        text: "Error performing request"
                    });
                    node.error("Error processing search. " + JSON.stringify(errors));
                } else if (response.statusCode === 200) {
                    node.status({});
                    var artefacts = body;
                    if (artefacts) {

                        node.log("Processing issues ");
                        issues.issues.forEach(callback);
                    }

                } else if (response.statusCode === 400) {
                    node.status({
                        fill: "red",
                        shape: "dot",
                        text: "Invalid query"
                    });
                } else {
                    node.status({
                        fill: "red",
                        shape: "dot",
                        text: "Error performing request"
                    });
                    node.error("Error processing search. status=" + response.statusCode + " errors=" + JSON.stringify(response));
                }


            };

            node.status({
                fill: "blue",
                shape: "dot",
                text: "Requesting..."
            });
            server.search(jql, options, rqcallback);
        }
    }

    function TuleapServerNode(config) {
        RED.nodes.createNode(this, config);
        this.log(config);
        var node = this;
        var url = config.url;
        var token = this.credentials.token;
        var request = require("request");


        this.doRequest = function(options, callback) {
            options.headers = {
                'X-Auth-Token': token,
                'accept': 'application/json'
            };
            this.log("DoRequest " + options);
            request(options, callback);
        }



        this.search = function(query, options, callback) {

            var options = {
                rejectUnauthorized: false,
                uri: decodeURIComponent(url + '/trackers/' + id + '/artifacts?limit=&expert_query=Description%20%3D%20%22GED4%22'),
                method: 'GET',
                json: true,
                followAllRedirects: true,

                body: {
                    jql: jql,
                    startAt: options.startAt || 0,
                    maxResults: options.maxResults || 1000,
                    fields: options.fields || ["summary", "status", "key", "issuetype"],
                    expand: options.expand || ['schema', 'names']
                }
            };
            this.log("Calling dorequest");
            this.doRequest(options, callback);
        }


    }



    RED.nodes.registerType("tuleap-server", TuleapServerNode, {
        credentials: {
            token: {
                type: "text"
            },
        }
    });

    RED.nodes.registerType("tuleap-artefact-search", TuleapArtefactSearchNode);

}