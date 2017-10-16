$('#formDeclContribuiPrev').validate({
    rules: {
        refIni: {
            required: true,
            depends: function(el) {

                if(el.value.trim() == '') {
                    el.setAttribute('style', 'border-color: red !important');
                } else {
                    el.setAttribute('style', 'border-color: #FFA500 !important');
                }

            }
        },
        refFin: {
            required: true,
            depends: function(el) {

                if(el.value.trim() == '') {
                    el.setAttribute('style', 'border-color: red !important');
                } else {
                    el.setAttribute('style', 'border-color: #FFA500 !important');
                }

            }
        },

    },
    messages: {
        refIni: "Data inicial é obrigatória!",
        refFin: "Data final é obrigatória!"
    }
});
