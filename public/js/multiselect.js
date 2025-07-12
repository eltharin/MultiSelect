class MultiSelect {

    static defaultOptions = {
        'select_class': "multi-select-container",                     //
        'inputdiv_class': 'multiple-select',                     //
        'tooglediv_class': "toogle-div",                     //
        'optionlabel_class': 'option-label',//"input-div",                     //
        'optionlabelall_class': 'option-label-all',//"input-div",                     //
        'checkAll': true,                     // afficher Tout cocher
        'checkAllLabelText': 'Tous',                     // Tout cocher Label
        'getSelectClassOnInput': true,                     //
        'onChange': null,                     //

    };

    constructor(selectElement, options = {}) {
        if (!(selectElement instanceof HTMLSelectElement)) {
            throw new Error("L'élément fourni doit être un élément HTML <select>.");
        }

        this.selectElement = selectElement;

        this.options = {...this.constructor.defaultOptions, ...options};

        this.init();
    }

    init() {
        // Masquer le <select multiple>
        this.selectElement.style.display = "none";

        // Créer le conteneur principal
        this.container = document.createElement("div");
        this.container.classList.add(this.options["select_class"]);

        this.inputDiv = document.createElement("div");
        this.spanDiv = document.createElement("span");
        this.inputDiv.append(this.spanDiv);

        if(this.options['getSelectClassOnInput']) {
            this.inputDiv.classList = this.selectElement.classList;
        }

        if(this.options["inputdiv_class"]) {
            this.inputDiv.classList.add(this.options["inputdiv_class"]);
        }

        this.updateSelectedCount();

        this.inputDiv.addEventListener("click", () => {
            const isVisible = this.toogleDiv.style.display !== "none";
            this.toogleDiv.style.display = isVisible ? "none" : "block";
        });

        this.container.appendChild(this.inputDiv);

        this.toogleDiv = document.createElement("div");
        this.toogleDiv.classList.add(this.options["tooglediv_class"]);
        this.toogleDiv.style.display = "none"; // Masquer initialement

        // Créer le champ de recherche
        this.searchInput = document.createElement("input");
        this.searchInput.type = "text";
        this.searchInput.placeholder = "Rechercher...";
        this.searchInput.classList.add("search-input");

        this.searchInput.addEventListener("input", () => {
            const query = this.searchInput.value.toLowerCase();
            this.filterOptions(query);
        });

        this.toogleDiv.appendChild(this.searchInput);

        // Créer la liste des options (avec support pour optgroup)
        this.optionsContainer = document.createElement("div");
        this.optionsContainer.classList.add("options-container");

        if(this.options['checkAll'] && this.selectElement.getAttribute('multiple') == 'multiple')
        {
            this.createCheckAll();
        }

        this.createSelectValues();

        this.toogleDiv.appendChild(this.optionsContainer);
        this.container.appendChild(this.toogleDiv);

        this.selectElement.parentNode.insertBefore(this.container, this.selectElement.nextSibling);

        //-- masquer toogle si click outside
        document.addEventListener('click', (event) => {
            if(!this.container.contains(event.target)) {
                this.toogleDiv.style.display = "none";
            }
        });

        // Synchro select
        this.updateSelectElement();
    }

    updateSelectValues() {

        this.updateSelectElement();
        this.optionsContainer.replaceChildren();
        this.createSelectValues();
    }

    createSelectValues() {
        Array.from(this.selectElement.children).forEach(child => {
            if (child.tagName === "OPTGROUP") {
                // Gérer les groupes d'options
                const group = document.createElement("div");
                group.classList.add("option-group");

                const groupLabel = document.createElement("div");
                groupLabel.textContent = child.label;
                groupLabel.classList.add("group-label");

                group.appendChild(groupLabel);

                Array.from(child.children).forEach(option => {
                    const checkbox = this.createCheckbox(option);
                    group.appendChild(checkbox);
                });

                this.optionsContainer.appendChild(group);
            } else if (child.tagName === "OPTION") {
                // Gérer les options individuelles
                const checkbox = this.createCheckbox(child);
                this.optionsContainer.appendChild(checkbox);
            }
        });
    }

    createCheckbox(option) {
        const label = document.createElement("label");
        label.classList.add(this.options['optionlabel_class']);

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.referedOption = option;
        checkbox.value = option.value;
        checkbox.checked = option.selected;

        checkbox.addEventListener("change", () => {
            if(this.selectElement.getAttribute('multiple') == 'multiple' || checkbox.checked) {
                option.selected = checkbox.checked;
            }
            this.updateSelectElement();
            this.updateSelectedCount();
        });

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(option.text));

        return label;
    }

    createCheckAll() {
        const label = document.createElement("label");
        label.classList.add(this.options['optionlabel_class']);
        label.classList.add(this.options['optionlabelall_class']);

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = '';
        checkbox.checked = false;

        checkbox.addEventListener("change", () => {
            let isAllChecked = true;
            this.optionsContainer.querySelectorAll("input[type='checkbox']").forEach((c) => {
                if(c.referedOption) {
                    if (c.parentElement.style.display != 'none') {
                        c.referedOption.selected = checkbox.checked;
                    } else if(!c.referedOption.selected) {
                        isAllChecked = false;
                    }
                }
            });
            if(!isAllChecked && checkbox) {
                checkbox.checked = false;
            }

            this.updateSelectElement();
            this.updateSelectedCount();
        });

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(this.options['checkAllLabelText']));
        this.optionsContainer.appendChild(label);
    }
    //--todo
    filterOptions(query) {
        Array.from(this.optionsContainer.querySelectorAll(".option-label, .group-label")).forEach(label => {
            if(!label.classList.contains('option-label-all'))
            {
                const text = label.textContent.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
                label.style.display = text.includes(query.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()) ? "" : "none";
            }
        });
    }

    updateSelectElement() {
        const checkboxes = this.optionsContainer.querySelectorAll("input[type='checkbox']");
        checkboxes.forEach(checkbox => {
            if (checkbox.referedOption) {
                checkbox.checked = checkbox.referedOption.selected;
            }
        });
        this.selectElement.dispatchEvent( new CustomEvent('change', {"bubbles":true, "cancelable":false, 'detail':{}}));
    }

    updateSelectedCount() {
        const allElements = Array.from(this.selectElement.options);
        const selectedElements = allElements.filter(option => option.selected);

        if(selectedElements.length == 0)
        {
            this.spanDiv.textContent = 'Choisissez...';
        }
        else if(selectedElements.length == allElements.length)
        {
            this.spanDiv.textContent = 'Tous';
        }
        else if(selectedElements.length == 1)
        {
            this.spanDiv.textContent = selectedElements[0].label;
        }
        else
        {
            this.spanDiv.textContent = `${selectedElements.length} éléments sélectionnés`;
        }
    }
}
