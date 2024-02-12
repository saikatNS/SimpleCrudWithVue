const { GridPlugin, Page, Edit, Toolbar, Sort, ForeignKey, Filter } = ejs.grids;
const { Query, Predicate } = ejs.data;
const { detach, L10n, loadCldr, setCulture } = ejs.base;
const { MultiSelectPlugin, MultiSelect, DropDownListPlugin, AutoCompletePlugin, DropDownList } = ejs.dropdowns;

Vue.use(GridPlugin);
Vue.use(DropDownListPlugin);
let categoryItem,categoryObj;
let selectedCol;

const projectPages = new Vue({
    el: "#project_list",
    data() {
        const app = this;
        
        return {
            fields: { text: 'text', value: 'value' },
            projects: [],
            categories: [],
            errortext:"habi jabi",
            settings: {
                gridSettings: {
                    scrollSettings: { width: 886, height: 300 },
                    allowScrolling: true,
                    editSettings: { allowEditing: true, allowAdding: true, allowDeleting: true, showDeleteConfirmDialog: true },
                },
                pageSettings: { pageSize: 3, pageSizes: ["4", "5", "10"] },
                toolbarOptions: ['Add', 'Edit', 'Delete', 'Update', 'Cancel'],
                filterOptions: {
                    type: 'Menu'
                },
                
            },
            customerIDRules: { required: true },
            categoryParams: {
                create: () => {
                    categoryItem = document.createElement('input');
                    return categoryItem;
                },
                read: () => {
                    return categoryObj.text;
                },
                destroy: () => {
                    categoryObj.destroy();
                },
                write: (args) => {
                    categoryObj = new DropDownList({
                        showClearButton: true,
                        allowFiltering: true,
                        filterType: 'Contains',
                        popupWidth: 'auto',
                        dataSource: app.categories,
                        value: args.rowData["categoryId"],
                        fields: { value: 'categoryId', text: 'name' },
                        placeholder: 'Select',
                        change: (e) => {
                            args.rowData["categoryId"] = e.value;
                        },
                    });
                    categoryObj.appendTo(categoryItem);

                }
            },
            ProductValueValidationRules: {
                required: [this.customValidationFn, this.errortext],
                
            }
        }
    },
    provide: {
        grid: [Page, Edit, Sort, Toolbar, ForeignKey, Filter]
    },
    created() {
        this.loadCategories();
    },
    methods: {
        rowSelected(args) {
            selectedCol = args.rowIndex;
        },
        loadProjects() {
            helper.get("/Projects/GetAll",
                this.filter,
                (response) => {
                    if (response.success) {

                        this.projects = response.data;
                    } else {
                        $.notify(response.message, "error");
                    }
                })
        },
        loadCategories() {
            helper.get("/Categories/GetAll",
                this.filter,
                (response) => {
                    if (response.success) {

                        this.categories = response.data;
                        this.loadProjects();
                    } else {
                        $.notify(response.message, "error");
                    }
                })
        },
        onActionComplete(args) {
            let action = args.action;
            let request = args.requestType;
            let data = args.data;
            
            if (args.requestType == 'save') {
                data.categoryId = args.rowData.categoryId;
                args.cancel = true;
            }
            if (request === "delete") {
                    this.removeItem(data[0]);
            } else if (action === "add" && request === "save") {
                  this.createItem(data);
            } else if (action === "edit" && request === "save") {
                   this.updateItem(data);
            }
        },
        removeItem(args) {
            helper.del("/Projects/DeleteProject",
                JSON.stringify(args.projectId),
                (response) => {
                    if (response.success) {
                        $.notify(response.message, "success");
                        this.loadProjects();
                    } else {
                        $.notify(response.message, "error");
                    }
                });
        },
        updateItem(args) {
            console.log(args);
            helper.post("/Projects/EditProject",
                JSON.stringify(args),
                (response) => {
                    if (response.success) {
                        $.notify(response.message, "success");
                        this.loadProjects();
                    } else {
                        $.notify(response.message, "error");
                    }
                });
        },
        createItem(args) {
            helper.post("/Projects/CreateProject",
                JSON.stringify(args),
                (response) => {
                    if (response.success) {
                        $.notify(response.message, "success");
                        this.loadProjects();
                    } else {
                        $.notify(response.message, "error");
                    }
                });
        },
        customValidationFn(args) {
            var rowEle = this.$refs.grid.getColumnByField('categoryId').index;
            var category = this.$refs.grid.getCellFromIndex(selectedCol, rowEle).textContent;
            let isTrue = false;
            if (args.value != undefined) {
                switch (category) {
                    case "Bike":
                        if (args.value > 100000 && args.value < 550000) {
                            isTrue = true;
                        } else {
                            this.errortext = "Please enter valid Bike Prices";
                        }
                        break;

                    case "Furniture":
                        if (args.value > 1000 && args.value < 20000) {
                            isTrue = true;
                        } else {
                            this.errortext = "Please enter valid Furniture Prices";
                        }
                        break;

                    case "Tv":
                        if (args.value > 20000 && args.value < 250000) {
                            isTrue = true;
                        } else {
                            this.errortext = "Please enter valid Tv Prices";
                        }
                        break;

                    case "Laptop":
                        if (args.value > 50000 && args.value < 250000) {
                            isTrue = true;
                        } else {
                            this.errortext = "Please enter valid Laptop Prices";
                        }
                        break;
                }
            }
            console.log(this.errortext);
            return isTrue;
        }
    }
    
})