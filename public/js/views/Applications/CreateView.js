define([
    "text!templates/Applications/CreateTemplate.html",
    "models/ApplicationsModel",
    "common",
	"populate"
],
    function (CreateTemplate, ApplicationModel, common, populate) {

        var CreateView = Backbone.View.extend({
            el: "#content-holder",
            contentType: "Applications",
            template: _.template(CreateTemplate),
            imageSrc: '',
            initialize: function () {
                _.bindAll(this, "saveItem", "render");
                this.model = new ApplicationModel();
                this.page=1;
                this.pageG=1;
				this.responseObj = {};
                this.render();
            },
            events: {
                "click #tabList a": "switchTab",
                "click #hire": "isEmployee",
                "change #workflowNames": "changeWorkflows",
                "mouseenter .avatar": "showEdit",
                "mouseleave .avatar": "hideEdit",
                "click .current-selected": "showNewSelect",
                "click": "hideNewSelect",
                "change .inputAttach": "addAttach",
				"click .deleteAttach":"deleteAttach",
                'keydown': 'keydownHandler',
                'click .dialog-tabs a': 'changeTab',
                'click .addUser': 'addUser',
                'click .addGroup': 'addGroup',
                'click .unassign': 'unassign',
                "click .prevUserList":"prevUserList",
                "click .nextUserList":"nextUserList",
                "click .newSelectList li:not(.miniStylePagination)": "chooseOption",
                "click .newSelectList li.miniStylePagination": "notHide",
                "click .newSelectList li.miniStylePagination .next:not(.disabled)": "nextSelect",
                "click .newSelectList li.miniStylePagination .prev:not(.disabled)": "prevSelect"
            },
            notHide: function (e) {
				return false;
            },

			nextSelect:function(e){
				this.showNewSelect(e,false,true);
			},
			prevSelect:function(e){
				this.showNewSelect(e,true,false);
			},
            keydownHandler: function(e){
                switch (e.which){
                    case 27:
                        this.hideDialog();
                        break;
                    default:
                        break;
                }
            },

            changeTab:function(e){
                var holder = $(e.target);
                holder.closest(".dialog-tabs").find("a.active").removeClass("active");
                holder.addClass("active");
                var n = holder.parents(".dialog-tabs").find("li").index(holder.parent());
                var dialog_holder = $(".dialog-tabs-items");
                dialog_holder.find(".dialog-tabs-item.active").removeClass("active");
                dialog_holder.find(".dialog-tabs-item").eq(n).addClass("active");
            },

            addUser:function(e){
                var self = this;
                $(".addUserDialog").dialog({
                    dialogClass: "add-user-dialog",
                    width: "900px",
                    buttons:{
                        save:{
                            text:"Choose",
                            class:"btn",

                            click: function(){
                                self.addUserToTable("#targetUsers");
                                $( this ).dialog( "close" );
                            }

                        },
                        cancel:{
                            text:"Cancel",
                            class:"btn",
                            click: function(){
                                $( this ).dialog( "close" );
                            }
                        }
                    }

                });
                $("#targetUsers").unbind().on("click","li",this.removeUsers);
                $("#sourceUsers").unbind().on("click","li",this.addUsers);
                $(".nextUserList").unbind().on("click",function(e){
                    self.page+=1;
                    self.nextUserList(e,self.page);
                });
                $(".prevUserList").unbind().on("click",function(e){
                    self.page-=1;
                    self.prevUserList(e,self.page);
                });
            },

            addUserToTable:function(id) {
                var groupsAndUser_holder = $(".groupsAndUser");
                var groupsAndUserHr_holder = $(".groupsAndUser tr");
                groupsAndUser_holder.show();
                groupsAndUserHr_holder.each(function(){
                    if ($(this).data("type")==id.replace("#","")){
                        $(this).remove();
                    }
                });
                $(id).find("li").each(function(){
                    groupsAndUser_holder.append("<tr data-type='"+id.replace("#","")+"' data-id='"+ $(this).attr("id")+"'><td>"+$(this).text()+"</td><td class='text-right'></td></tr>");
                });
                if (groupsAndUserHr_holder.length<2){
                    groupsAndUser_holder.hide();
                }
            },

            addGroup:function(){
                var self = this;
                $(".addGroupDialog").dialog({
                    dialogClass: "add-group-dialog",
                    width: "900px",
                    buttons:{
                        save:{
                            text:"Choose",
                            class:"btn",
                            click: function(){
                                self.addUserToTable("#targetGroups");
                                $( this ).dialog( "close" );
                            }
                        },
                        cancel:{
                            text:"Cancel",
                            class:"btn",
                            click: function(){
                                $( this ).dialog( "close" );
                            }
                        }
                    }

                });
                $("#targetGroups").unbind().on("click","li",this.removeUsers);
                $("#sourceGroups").unbind().on("click","li",this.addUsers);
                $(".nextGroupList").unbind().on("click",function(e){
                    self.pageG+=1;
                    self.nextUserList(e,self.pageG);
                });
                $(".prevGroupList").unbind().on("click",function(e){
                    self.pageG-=1;
                    self.prevUserList(e,self.pageG);
                });

            },

            unassign:function(e){
                var holder = $(e.target);
                var id = holder.closest("tr").data("id");
                var type = holder.closest("tr").data("type");
                var text = holder.closest("tr").find("td").eq(0).text();
                $("#"+type).append("<option value='"+id+"'>"+text+"</option>");
                holder.closest("tr").remove();
                var groupsAndUser_holder = $(".groupsAndUser");
                if (groupsAndUser_holder.find("tr").length==1){
                    groupsAndUser_holder.hide();
                }
            },

            nextUserList:function(e,page){
                common.populateUsersForGroups('#sourceUsers','#targetUsers',null,page);
            },

            prevUserList:function(e,page){
                common.populateUsersForGroups('#sourceUsers','#targetUsers',null,page);
            },

            addUsers: function (e) {
                e.preventDefault();
                $(e.target).closest(".ui-dialog").find(".target").append($(e.target));

            },

            removeUsers: function (e) {
                e.preventDefault();
                $(e.target).closest(".ui-dialog").find(".source").append($(e.target));
            },
			deleteAttach:function(e){
				$(e.target).closest(".attachFile").remove();
			},
            addAttach: function (event) {
				var s= $(".inputAttach:last").val().split("\\")[$(".inputAttach:last").val().split('\\').length-1];
				$(".attachContainer").append('<li class="attachFile">'+
											 '<a href="javascript:;">'+s+'</a>'+
											 '<a href="javascript:;" class="deleteAttach">Delete</a></li>'
											 );
				$(".attachContainer .attachFile:last").append($(".input-file .inputAttach").attr("hidden","hidden"));
				$(".input-file").append('<input type="file" value="Choose File" class="inputAttach" name="attachfile">');
			},
            hideDialog: function () {
                $(".edit-dialog").remove();
                $(".add-group-dialog").remove();
                $(".add-user-dialog").remove();
            },
            getWorkflowValue: function (value) {
                var workflows = [];
                for (var i = 0; i < value.length; i++) {
                    workflows.push({ name: value[i].name, status: value[i].status });
                }
                return workflows;
            },

            changeWorkflows: function () {
                var name = this.$("#workflowNames option:selected").val();
                var value = this.workflowsCollection.findWhere({ name: name }).toJSON().value;
                //$("#selectWorkflow").html(_.template(selectTemplate, { workflows: this.getWorkflowValue(value) }));
            },

            isEmployee: function (e) {
                $(e.target).addClass("pressed");
                this.saveItem();
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
            showEdit: function () {
                $(".upload").animate({
                    height: "20px",
                    display: "block"
                }, 250);

            },
            hideEdit: function () {
                $(".upload").animate({
                    height: "0px",
                    display: "block"
                }, 250);

            },
            fileSizeIsAcceptable: function(file){
                if(!file){return false;}
                return file.size < App.File.MAXSIZE;
            },

            saveItem: function () {
                var self = this;
                var mid = 39;

                var isEmployee = false;
                if (this.$("#hire>span").hasClass("pressed")) {
                    isEmployee = true;
                    self.contentType = "Employees";
                }
                //var subject = $.trim($("#subject").val());
                var first = $.trim($("#first").val());
                var last = $.trim($("#last").val());
                var name = {
                    first: first,
                    last: last
                };
                var pemail = $.trim($("#pemail").val());
                var phone = $.trim($("#phone").val());
                var mobile = $.trim($("#mobile").val());
                var wphones = {
                    phone: phone,
                    mobile: mobile
                };

                var workflow = $("#workflowsDd").data("id");
                var relatedUserId = $("#relatedUsersDd option:selected").val();
                var nextAction = $.trim($("#nextAction").val());
                /*var nextAction = "";
                if (nextActionSt) {
                    nextAction = new Date(Date.parse(nextActionSt)).toISOString();
                }*/
                var sourceId = $("#sourceDd").data("id");
                var referredBy = $.trim($("#referredBy").val());
                var departmentId = $("#departmentDd").data("id");

                var jobPositionId = $("#jobPositionDd").data("id");
                var jobType= this.$el.find("#jobTypeDd").data("id");
                var expectedSalary = $.trim($("#expectedSalary").val());
                var proposedSalary = $.trim($("#proposedSalary").val());
                var tags = $.trim($("#tags").val()).split(',');
                var otherInfo = $("#otherInfo").val();

                var usersId=[];
                var groupsId=[];
                $(".groupsAndUser tr").each(function(){
                    if ($(this).data("type")=="targetUsers"){
                        usersId.push($(this).data("id"));
                    }
                    if ($(this).data("type")=="targetGroups"){
                        groupsId.push($(this).data("id"));
                    }

                });
                var whoCanRW = this.$el.find("[name='whoCanRW']:checked").val();
                this.model.save({
                    isEmployee: isEmployee,
                    //subject: subject,
                    imageSrc: this.imageSrc,
                    name: name,
                    personalEmail: pemail,
                    workPhones: wphones,
                    relatedUser: relatedUserId,
                    nextAction: nextAction,
                    source: sourceId,
                    referredBy: referredBy,
                    department: departmentId,
                    jobPosition: jobPositionId,
                    expectedSalary: expectedSalary,
                    proposedSalary: proposedSalary,
                    tags: tags,
					jobType:jobType,
                    otherInfo: otherInfo,
                    workflow: workflow,
                    groups: {
                        owner: $("#allUsers").val(),
                        users: usersId,
                        group: groupsId
                    },
                    whoCanRW: whoCanRW
                },
                {
                    headers: {
                        mid: mid
                    },
                    wait: true,
                    success: function (model) {
						var currentModel = model.changed.result;
						var currentModelID = currentModel["_id"];
						var addFrmAttach = $("#createApplicationForm");
						var fileArr= [];
						var addInptAttach = '';
						$("li .inputAttach").each(function(){
							addInptAttach = $(this)[0].files[0];
							fileArr.push(addInptAttach);
							if(!self.fileSizeIsAcceptable(addInptAttach)){
								alert('File you are trying to attach is too big. MaxFileSize: ' + App.File.MaxFileSizeDisplay);
								return;
							}
						});
							addFrmAttach.submit(function (e) {
								var bar = $('.bar');
								var status = $('.status');
								
								var formURL = "http://" + window.location.host + "/uploadApplicationFiles";
								e.preventDefault();
								addFrmAttach.ajaxSubmit({
									url: formURL,
									type: "POST",
									processData: false,
									contentType: false,
												   data: [fileArr],

									beforeSend: function (xhr) {
										xhr.setRequestHeader("id", currentModelID);
										status.show();
										var statusVal = '0%';
										bar.width(statusVal);
										status.html(statusVal);
									},
									
									uploadProgress: function(event, position, total, statusComplete) {
										var statusVal = statusComplete + '%';
										bar.width(statusVal);
										status.html(statusVal);
									},
									
									success: function () {
										console.log('Attach file');
										addFrmAttach[0].reset();
										status.hide();
										self.hideDialog();
										Backbone.history.navigate("easyErp/" + self.contentType, { trigger: true });
									},

									error: function () {
										console.log("Attach file error");
									}
								});
							});
						if(fileArr.length>0){
							addFrmAttach.submit();
						}
						else{
							self.hideDialog();
							Backbone.history.navigate("easyErp/" + self.contentType, { trigger: true });

						}
						addFrmAttach.off('submit');

                    },
                    error: function () {
                        Backbone.history.navigate("home", { trigger: true });
                    }
                });
            },
			hideNewSelect:function(){
				$(".newSelectList").hide();
			},
            showNewSelect:function(e,prev,next){
                populate.showSelect(e,prev,next,this);
                return false;	
            },

			chooseOption:function(e){
                $(e.target).parents("dd").find(".current-selected").text($(e.target).text()).attr("data-id",$(e.target).attr("id"));
			},

            render: function () {
                var formString = this.template();
                var self = this;
                this.$el = $(formString).dialog({
					closeOnEscape: false,
                    dialogClass: "edit-dialog create-app-dialog",
                    width: 690,
                    title: "Create Application",
                    buttons:{
                        save:{
                            text: "Save",
                            class: "btn",
                            click: self.saveItem
                        },
                        cancel:{
                            text: "Cancel",
                            class: "btn",
                            click: self.hideDialog
                        }
                    }
                });
                common.populateUsersForGroups('#sourceUsers','#targetUsers',null,this.page);
                common.populateUsers("#allUsers", "/UsersForDd",null,null,true);
                common.populateDepartmentsList("#sourceGroups","#targetGroups", "/DepartmentsForDd",null,this.pageG);
				populate.getWorkflow("#workflowsDd","#workflowNamesDd","/WorkflowsForDd",{id:"Applications"},"name",this,true);
				populate.get("#departmentDd","/DepartmentsForDd",{},"departmentName",this,true);
				populate.get("#jobPositionDd","/JobPositionForDd",{},"name",this,true);
				populate.get("#jobTypeDd","/jobType",{},"_id",this,true);
                common.canvasDraw({ model: this.model.toJSON() }, this);
                $('#nextAction').datepicker({
                    dateFormat: "d M, yy",
                    changeMonth: true,
                    changeYear: true,
                    minDate: new Date()
                });
                this.delegateEvents(this.events);
                return this;
            }

        });

        return CreateView;
    });
