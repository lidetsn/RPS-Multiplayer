Forms = (function() {
    return {
        // form validation
        validateForm: function(formFields) {
            //validate
            var valid = true;
            formFields.forEach(function(item) {
                if (item.value == "") {
                    valid = false;
                    item.parentElement.classList.add("is-invalid");
                } else {
                    item.parentElement.classList.remove("is-invalid");
                }
            });
            return valid;
        }
    }
})();