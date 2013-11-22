define([
    'text!templates/Workflows/list/ListTemplate.html',
    'views/Workflows/list/ListItemView',
    'text!templates/Workflows/form/FormTemplate.html',
    'custom'
],
function (ListTemplate, ListItemView, FormTemplate, Custom) {
    var ContentView = Backbone.View.extend({
        el: '#content-holder',
        initialize: function (options) {
            console.log('Init Workflows View');
            this.collection = options.collection;
            this.collection.bind('reset', _.bind(this.render, this));
            this.render();
        },

        events: {
            "click .checkbox": "checked",
            "click td:not(:has('input[type='checkbox']'))": "gotoForm",
            "click a.workflow": "chooseWorkflowNames",
            "click .workflow-sub-list li": "chooseWorkflowDetailes",
            "click .workflow-list li": "chooseWorkflowNames",
            "click #workflowNames div.cathegory a": "chooseWorkflowDetailes",
            "click #workflowSubNames div.cathegory a": "chooseWorkflowDetailes",
            "click #workflowNames span": "chooseWorkflowDetailes",
            "click .person-info dd .edit": "edit",
            "click a:contains('Cancel')": "cancel",
            "click a:contains('Save')": "save"
        },

        save: function (e) {
            e.preventDefault();
            var span = $(e.target).parent().find("span");
            var id = span.data("id");
            var model = this.collection.get(id),
                obj;
            if (span.hasClass("name")) {
                obj = {
                    name: span.text()
                };
            } else {
                obj = {
                    status: span.text()
                };
            }
            this.collection.url = "/Workflows";
            console.log(obj);
            model.set(obj);
            model.save({}, {
                headers: {
                    mid: 39
                },
                success: function() {
                    Backbone.history.navigate("#home/content-Workflows", { trigger: true });
                }
            });
        },

        cancel: function (e) {
            e.preventDefault();
            $(e.target).parent().find("span, .edit").removeClass("hidden").end().find("input, a:contains('Cancel'), a:contains('Save')").remove();
        },

        edit: function (e) {
            e.preventDefault();
            var target = $(e.target);
            var value = target.siblings("span").text();
            var text = "<a href='#'>";
            target.parent().find("span, .edit").addClass("hidden").end().append(
                $("<input>").val(value),
                $(text).text("Save"),
                $(text).text("Cancel")
            );
        },

        gotoForm: function (e) {
            App.ownContentType = true;
            var itemIndex = $(e.target).closest("tr").data("index") + 1;
            window.location.hash = "#home/content-Workflows/form/" + itemIndex;
        },

        chooseSubWorkflowNames: function (e) {
            alert($(e.target).hasClass("workflow-sub"));

        },
        chooseWorkflowNames: function (e) {
            this.$(".workflow-sub-list>*").remove();
            this.$("#details").addClass("active").show();
            this.$("#workflowNames").html("");
            $(e.target).parents(".workflow-list").find(".active").removeClass("active");
            var wId = "";
            if ($(e.target).hasClass("workflow")) {
                $(e.target).parent().addClass("active");
                wId = $(e.target).text();
            } else {
                $(e.target).addClass("active");
                wId = $(e.target).find("a").text();

            }
            var names = [], wName;
            _.each(this.collection.models, function (model) {
                if (model.get('wId') == wId && wName != model.get('wName')) {
                    names.push(model.get('wName'));
                    wName = model.get('wName');
                }
            }, this);

            var first = false;
            _.each(names, function (name) {
                if (first) {
                    this.$(".workflow-sub-list").append("<li class='active'><a class='workflow-sub' data-id='" + name + "'href='javascript:;'>" + name + "</a></li>");
                    first = false;
                }
                else {
                    this.$(".workflow-sub-list").append("<li data-id='" + name + "'><a class='workflow-sub' data-id='" + name + "'href='javascript:;'>" + name + "</a></li>");
                }
                this.$("#sub-details").html("");
            }, this);
        },
        chooseWorkflowDetailes: function (e) {
            $(e.target).parents(".workflow-sub-list").find(".active").removeClass("active");
            if ($(e.target).hasClass("workflow-sub")) {
                $(e.target).parent().addClass("active");
            } else {
                $(e.target).addClass("active");
            }
            this.$("#sub-details").html("");
            var name = $(e.target).data("id");
            var nameDetails = this.$("#sub-details").attr("data-id");
            if (name == nameDetails && this.$("#sub-details").hasClass("active")) {
                this.$("#details").hide(150, function () {
                    $(this).removeClass("active");
                })
                return;
            }
            else {
                this.$("#details").show(150, function () {
                    $(this).addClass("active");
                })
            }
            var values = [];
            _.each(this.collection.models, function (model) {
                if (model.get('wName') == name) {
                    console.log(model);
                    values.push({ id: model.get("_id"), name: model.get('name'), status: model.get('status'), sequence: model.get('sequence'), color: model.get('color') });
                    console.log(values);
                }
            }, this);
            this.$("#sub-details").attr("data-id", name)
            _.each(values, function (value) {
                this.$("#sub-details").append(new ListItemView({ model: value }).render().el);
            }, this);
        },

        render: function () {
            Custom.setCurrentCL(this.collection.models.length);
            console.log('Render Workflows View');
            var workflowsWIds = _.uniq(_.pluck(this.collection.toJSON(), 'wId'), false);
            this.$el.html(_.template(ListTemplate, { workflowsWIds: workflowsWIds }));
            return this;
        },

        checked: function () {
            if ($("input:checked").length > 0)
                $("#top-bar-deleteBtn").show();
            else
                $("#top-bar-deleteBtn").hide();
        },

        deleteItems: function () {
            var self = this,
                mid = 39,
                model;

            $.each($("tbody input:checked"), function (index, checkbox) {
                model = self.collection.get(checkbox.value);
                model.destroy({
                    headers: {
                        mid: mid
                    }
                });
            });
            this.collection.trigger('reset');
        }
    });

    return ContentView;
});
