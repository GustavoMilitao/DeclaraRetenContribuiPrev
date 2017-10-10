angular
    .module('app', [])
    .controller('HistoricoController', function($scope, $http) {

        $scope.historicoList = [];

        //Pega instância do jquery
        $ = window.jQuery;


        $(document).on('click', '.showHidePagadoras', function(e) {

            e.preventDefault();

            var alvo = $('#' + this.id + '_alvo');

            if($(alvo).is(':visible')) {

                $(alvo).hide();

                $(this).find('span')
                    .removeClass('glyphicon-minus-sign')
                    .removeClass('active')
                    .addClass('glyphicon-plus-sign');

            } else {
                $(alvo).fadeIn();

                $(this).find('span')
                    .removeClass('glyphicon-plus-sign')
                    .addClass('glyphicon-minus-sign')
                    .addClass('active');
            }


        });


        $http({
            method: 'GET',
            url: 'source.json'
        }).then(function(response) {
            $scope.historicoList = response.data;
            console.log(response.data);

        })


    });
