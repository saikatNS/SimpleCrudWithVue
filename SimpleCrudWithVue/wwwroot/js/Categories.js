const { GridPlugin, Page, Edit, Toolbar, Sort, ForeignKey, Filter, GridColumn, Freeze } = ejs.grids;
const { Query, Predicate } = ejs.data;
const { detach, L10n, loadCldr, setCulture } = ejs.base;
const { MultiSelectPlugin, MultiSelect, DropDownListPlugin, AutoCompletePlugin, DropDownList } = ejs.dropdowns;

Vue.use(GridPlugin);
Vue.use(DropDownListPlugin);
let categoryItem, categoryObj;
let selectedCol;

const projectPages = new Vue({
    el: "#categories_list",
    data() {
        return {
            fields: { text: 'text', value: 'value' },
            projects: [],
            customColumns: [],
            categories: [],
            tName:"TEST",
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
            cTemplate: function () {
                return {
                    template: Vue.component('column', {
                        template:
                        `<div>
                            <span>{{camelCase(data.description)}}</span>
                        </div>`
                    }),
                    data: function () {
                        console.log(data);
                        return {
                            data: {}
}
                    },
                    computed: {
                        camelCase(str) {
                            console.log(str);
                            return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
                                return index == 0 ? word.toLowerCase() : word.toUpperCase();
                            }).replace(/\s+/g, '');
                        }
                    }
                }
            }
        }
    },
    provide: {
        grid: [Page, Edit, Sort, Toolbar, ForeignKey, Filter, Freeze]
    },
    created() {

    },
    mounted() {
        this.loadCategories();

    },
    methods: {
        loadCategories() {
            helper.get("/Categories/GetAll",
                this.filter,
                (response) => {
                    if (response.success) {
                        this.categories = response.data;   
                    } else {
                        $.notify(response.message, "error");
                    }
             })
        },
        onActionComplete() {

        }
    },

})