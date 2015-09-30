var Qafoo = Qafoo || {QA: {}};

(function () {
    "use strict";

    Qafoo.QA.SourceFile = React.createClass({
        render: function() {
            var file = this.props.file,
                nodeSelected = file.name === this.props.selected[0];

            return (<li className={nodeSelected ? "selected" : ""}>
                <ReactRouter.Link to={"/source/" + file.file.name}>
                    <span className="glyphicon glyphicon-file"></span> <span className="name">{this.props.file.name}</span>
                </ReactRouter.Link>
            </li>);
        }
    });

    Qafoo.QA.Source = React.createClass({
        sourceTree: {
            name: "/",
            type: "folder",
            children: {}
        },

        getInitialState: function() {
            return {
                loaded: false
            };
        },

        ensureStartingSlash: function(path) {
            while (path[0] === "/") {
                path = path.substring(1);
            }

            return "/" + path;
        },

        getFileName: function(string) {
            string = this.ensureStartingSlash(string);

            return this.ensureStartingSlash(string.replace(this.props.data.baseDir, "")).substring(1);
        },

        addFile: function(file) {
            var components = file.name.split("/"),
                treeReference = this.sourceTree;

            for (var i = 0; i < components.length; ++i) {
                var component = components[i];

                if (!treeReference.children[component]) {
                    treeReference.children[component] = {
                        name: component,
                        type: "folder",
                        children: {}
                    }
                }

                treeReference = treeReference.children[component];
            }

            treeReference.type = "file";
            treeReference.file = file;
        },

        componentWillMount: function() {
            var component = this;

            $.ajax('/data/source.zip', {
                method: "GET",
                contentType: "text/plain; charset=x-user-defined",
                dataType: "binary",
                responseType: "arraybuffer",
                processData: false,
                success: function(data) {
                    var source = new JSZip(data);

                    for (var file in source.files) {
                        component.addFile(source.files[file]);
                    }
                    component.setState({loaded: true});
                }
            });
        },

        render: function() {
            var file = this.getFileName(this.props.parameters.splat),
                selected = file.split("/");

            selected.unshift("/");
            return (<div className="row">
                <div className="col-md-4">
                    { !this.state.loaded ? (<h2>Loading source…</h2>) :
                    <ul className="source-tree">
                        <Qafoo.QA.SourceFolder folder={this.sourceTree} selected={selected} />
                    </ul>
                }</div>
                <div className="col-md-8">
                </div>
            </div>);
        }
    });
})();
