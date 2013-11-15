define([
    "text!templates/Companies/EditTemplate.html",
    "collections/Companies/CompaniesCollection",
    "collections/Employees/EmployeesCollection",
    "collections/Persons/PersonsCollection",
    "collections/Departments/DepartmentsCollection",
    "common",
    "custom",
    "dataService"
],
    function (EditTemplate, CompaniesCollection, EmployeesCollection, PersonsCollection, DepartmentsCollection, common, Custom,dataService) {

        var EditView = Backbone.View.extend({
            el: "#content-holder",
            contentType: "Companies",
            imageSrc: '',

            initialize: function (options) {
                this.employeesCollection = new EmployeesCollection();
                //this.employeesCollection.bind('reset', _.bind(this.render, this));
                this.departmentsCollection = new DepartmentsCollection();
                //this.departmentsCollection.bind('reset', _.bind(this.render, this));
                this.companiesCollection = options.collection;
                this.currentModel = this.companiesCollection.models[Custom.getCurrentII() - 1];
                this.render();
            },

            events: {
                "click #tabList a": "switchTab",
                "click #contacts": "editContacts"
            },

            switchTab: function (e) {
                e.preventDefault();
                var link = this.$("#tabList a");
                if (link.hasClass("selected")) {
                    link.removeClass("selected");
                }
                var index = link.index($(e.target).addClass("selected"));
                this.$(".tab").hide().eq(index).show();
            },

            editContacts: function (e) {
                e.preventDefault();
                var link = this.$("#tabList a");
                if (link.hasClass("selected")) {
                    link.removeClass("selected");
                }
                var index = link.index($(e.target).addClass("selected"));
                this.$(".tab").hide().eq(index).show();
            },

            saveItem: function () {
                var self = this;
                var itemIndex = Custom.getCurrentII() - 1;

                if (itemIndex != -1) {
                    var currentModel = this.collection.models[itemIndex];

                    var mid = 39;

                    var name = $("#name").val();

                    var address = {};
                    $("p").find(".address").each(function () {
                        var el = $(this);
                        address[el.attr("name")] = el.val();
                    });

                    var email = $("#email").val();

                    var phone = $("#phone").val();

                    var mobile = $("#mobile").val();

                    var fax = $("#fax").val();

                    var website = $("#website").val();

                    var internalNotes = $.trim($("#internalNotes").val());

                    var salesPersonId = this.$("#salesPerson option:selected").val();
                    var _salesPerson = common.toObject(salesPersonId, this.employeesCollection);
                    var salesPerson = {};
                    if (_salesPerson) {
                        salesPerson.id = _salesPerson._id;
                        salesPerson.name = _salesPerson.name.first + ' ' + _salesPerson.name.last;
                    } else {
                        salesPerson = currentModel.defaults.salesPerson;
                    }

                    var salesTeamId = this.$("#salesTeam option:selected").val();
                    var _salesTeam = common.toObject(salesTeamId, this.departmentsCollection);
                    var salesTeam = {};
                    if (_salesTeam) {
                        salesTeam.id = _salesTeam._id;
                        salesTeam.name = _salesTeam.departmentName;
                    } else {
                        salesTeam = currentModel.defaults.salesTeam;
                    }

                    var reference = $("#reference").val();

                    var language = $("#language").val();

                    var dateSt = $.trim($("#date").val());
                    var date = (dateSt) ? new Date(Date.parse(dateSt)) : "";

                    var isCustomer = ($("#isCustomer").is(":checked")) ? true : false;

                    var isSupplier = ($("#isSupplier").is(":checked")) ? true : false;

                    var active = ($("#active").is(":checked")) ? true : false;

                    currentModel.set({
                        name: name,
                        imageSrc: this.imageSrc,
                        email: email,
                        phones: {
                            phone: phone,
                            mobile: mobile,
                            fax: fax
                        },
                        address: address,
                        website: website,
                        internalNotes: internalNotes,
                        salesPurchases: {
                            isCustomer: isCustomer,
                            isSupplier: isSupplier,
                            active: active,
                            salesPerson: salesPerson,
                            salesTeam: salesTeam,
                            reference: reference,
                            language: language,
                            date: date
                        }
                    });

                    currentModel.save({}, {
                        headers: {
                            mid: mid
                        },
                        wait: true,
                        success: function (model) {
                            Backbone.history.navigate("home/content-" + self.contentType, { trigger: true });
                        },
                        error: function () {
                            Backbone.history.navigate("home", { trigger: true });
                        }
                    });
                }

            },
            template: _.template(EditTemplate),
            populateDropDown: function(type, selectId, url){
                var selectList = $(selectId);
                var self = this;
                dataService.getData(url, {mid:39}, function(response){
                    console.log('++++++++++++');
                    console.log(response);
                    var options = $.map(response.data, function(item){
                        switch (type){
                            case "salesPerson":
                                return self.salesPersonOption(item);
                            case "salesTeam":
                                return self.salesTeamOption(item);
                        }
                    });
                    selectList.append(options);
                });
            },
            salesPersonOption: function(item){
                return  this.currentModel.get("salesPurchases").salesPerson.id === item._id ?
                    $('<option/>').val(item._id).text(item.name.first +' '+item.name.last).attr('selected','selected') :
                    $('<option/>').val(item._id).text(item.name.first +' '+item.name.last);
            },
            salesTeamOption: function(item){
                return this.currentModel.get("salesPurchases").salesTeam.id === item._id ?
                    $('<option/>').val(item._id).text(item.departmentName).attr('selected','selected') :
                    $('<option/>').val(item._id).text(item.departmentName);
            },
            render: function () {

                var formString = this.template({
                    model: this.currentModel.toJSON()});

                this.$el = $(formString).dialog({
                    autoOpen:true,
                    resizable:false,
                    dialogClass: "edit-companies-dialog",
                    width:"50%",
                    height:513
                    //title: this.currentModel.toJSON().project.projectShortDesc
                });

                this.populateDropDown("salesPerson", App.ID.salesPerson, "/getSalesPerson");
                this.populateDropDown("salesTeam", App.ID.salesTeam, "/getSalesTeam");

                this.delegateEvents(this.events);
                /*
                var itemIndex = Custom.getCurrentII() - 1;
                var currentModel = this.companiesCollection.models[itemIndex];
                if (itemIndex == -1) {
                    this.$el.html();
                } else {
                    this.$el.html(_.template(EditTemplate, { model: currentModel.toJSON(), employeesCollection: this.employeesCollection, departmentsCollection: this.departmentsCollection }));
                }

                common.canvasDraw({ model: currentModel.toJSON() }, this);

                $('#date').datepicker({ dateFormat: "d M, yy" });
                 */
                return this;
            }

        });

        return EditView;
    });