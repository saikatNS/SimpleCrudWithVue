

const { GridPlugin, Page, Edit, Toolbar, Sort, ForeignKey, Filter, GridColumn, Freeze } = ejs.grids;
const { Query, Predicate } = ejs.data;
const { detach, L10n, loadCldr, setCulture } = ejs.base;
const { MultiSelectPlugin, MultiSelect, DropDownListPlugin, AutoCompletePlugin, DropDownList } = ejs.dropdowns;

Vue.use(GridPlugin);
Vue.use(DropDownListPlugin);
let categoryItem, categoryObj;
let selectedCol;

const projectPages = new Vue({
    el: "#project_list",
    data() {
        const app = this;

        return {
            fields: { text: 'text', value: 'value' },
            projects: [],
            customColumns: [],
            categories: [],
            errortext: "habi jabi",
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

            },
            headers:[]
        }
    },
    provide: {
        grid: [Page, Edit, Sort, Toolbar, ForeignKey, Filter, Freeze]
    },
    created() {
        this.loadCategories();
    },
    methods: {
        rowSelected(args) {
            selectedCol = args.rowIndex;
        },
        populatedProjectModel(projects) {
            const sortedAsc = JSON.parse(JSON.stringify(projects)).sort(
                (objA, objB) => (new Date(objA.fromDate)) - (new Date(objB.fromDate)),
            );
            const sortedDesc = JSON.parse(JSON.stringify(projects)).sort(
                (objA, objB) => (new Date(objB.toDate)) - (new Date(objA.toDate)),
            );

            var maxMonth = new Date(sortedDesc[0].toDate).getMonth() + 1;
            var maxYear = new Date(sortedDesc[0].toDate).getFullYear();
            var minMonth = new Date(sortedAsc[0].fromDate).getMonth() + 1;
            var minYear = new Date(sortedAsc[0].fromDate).getFullYear();
            

            projects.forEach(p => {
                p.years = [];
                var totalnumMon = 12 - (new Date(p.fromDate).getMonth() + 1);
                for (let mm = minMonth; mm <= 12; mm++) {
                    p.years.push({ monthPrice: (new Date(p.fromDate).getFullYear()) == minYear && mm >= (new Date(p.fromDate).getMonth() + 1) ? p.price / totalnumMon : 0, year: minYear, month: this.getMonthName(mm) })
                }
                for (let y = minYear + 1; y < maxYear; y++) {
                    ;
                    let mm = 1;
                    let mx = 12;
                    if ((new Date(p.fromDate).getFullYear()) == y) mm = new Date(p.fromDate).getMonth() + 1;
                    if ((new Date(p.toDate).getFullYear()) == y) mx = new Date(p.toDate).getMonth() + 1;
                    for (let mi = 1; mi <= 12; mi++) {

                        p.years.push({ monthPrice: (mi >= mm && mi <= mx && new Date(p.fromDate).getFullYear() <= y && new Date(p.toDate).getFullYear() >= y) ? p.price / (mx - mm + 1) : 0, year: y, month: this.getMonthName(mi) })
                    }
                }

                totalnumMon = new Date(p.toDate).getMonth() + 1;
                for (let mm = 1; mm <= maxMonth; mm++) {
                    p.years.push({ monthPrice: (new Date(p.toDate).getFullYear()) == maxYear && totalnumMon >= mm ? p.price / totalnumMon : 0, year: maxYear, month: this.getMonthName(mm) })
                }
            })

            var months = projects[0].years;
            var columns = [];

            for (let ly = minYear; ly <= maxYear; ly++) {
                let monthColumns = [];
                let yearHeaders = {
                    columns : monthColumns,
                    headerText: `${ly}`,
                    width:330
                }
                var filterdmonths = months.filter(m => m.year == ly);
                for (var i = 0; i < filterdmonths.length; i++) {
                    var month = filterdmonths[i].month;
                    let monthObj = {
                        template: function () {
                            return {
                                template: Vue.component(`Template`,
                                    {
                                        template: `<span>{{findMonthPrice}}</span>`,
                                        data: function () {
                                            return {
                                                data: {}
                                            };
                                        },
                                        computed: {
                                            findMonthPrice() {
                                                const col = this.data.years.find(x => x.year == ly && x.month == month);
                                                console.log(col);
                                                if (col)
                                                    return col.monthPrice;
                                                return ''
                                            }
                                        },
                                    })
                            }
                        },
                        headerText: `${month}`, width: 200, textAlign: 'Center', 
                    }
                    monthColumns.push(monthObj);
                }
                columns.push(yearHeaders)
            }
            
            this.customColumns = columns;
            this.projects = projects;
        },

        getMonthName(monthNumber) {
            const date = new Date();
            date.setMonth(monthNumber - 1);
            var data = date.toLocaleString('en-US', { month: 'short' });
            return data;
        },
        loadProjects() {
            helper.get("/Projects/GetAll",
                this.filter,
                (response) => {
                    if (response.success) {

                        //this.projects = response.data;
                        this.populatedProjectModel(response.data);
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