(function () {
	'use strict';

	angular
		.module('app.cooperados.declararetencontribuiprev', ['ngMask']/*['app.cooperados.service', 'ngRoute']*/
		, ['$qProvider', function ($qProvider) {
			$qProvider.errorOnUnhandledRejections(false);
		}])
		.controller('DeclaraRetenContribuiPrevController', DeclaraRetenContribuiPrevController);
	// .config(config);

	/** @ngInject */

	/** @ngInject */
	// function config($routeProvider){
	//     $routeProvider
	//     .when('/', {
	// 	templateUrl: '/js/cooperado/unimedbh/declararetencontribuiprev/declararetencontribuiprev.html',
	// 	controller: 'DeclaraRetenContribuiPrevController as vm',
	// 	resolve:{
	// 		consultarCooperado:function(cooperados){
	//              return cooperados.consultarCooperado();
	//         }
	// 	}
	//     })
	//     .otherwise({
	// 	redirectTo: '/'
	//     });

	// }


	/** @ngInject */
	function DeclaraRetenContribuiPrevController($scope,$http/*,cooperados,consultarCooperado*/) {

		$ = window.jQuery;

		/* URLS */
		$scope.getUrlAutenticacao = function () {
			return "https://areadocolaboradordesv.unimedbh.com.br/portalrh/conector?" +
				"SIS=FP&" +
				"LOGIN=SID&" +
				"ACAO=EXESENHA&" +
				"NOMUSU=webservice_INSSCoop&" +
				"SENUSU=abc123";
		}

		$scope.getUrlDadosCooperado = function (crm, acesso) {
			return "https://areadocolaboradordesv.unimedbh.com.br/portalrh/conector?" +
				"ACAO=EXECUTAREGRA&" +
				"SIS=FP&" +
				"REGRA=458&" +
				"metodo=buscaDadosInciais&" +
				"numEmp=3&" +
				"numCad=" + crm + "&" +
				"listaDeclaracoes=S&" +
				"listaCNPJ=S&" +
				"USER=webservice_INSSCoop&" +
				"CONNECTION=" + acesso + "&" +
				"listaFoto=N";
		}

		$scope.getUrlIncluirDeclaracao = function (refIni, refFin, empresasPagadoras, crm, acesso, sobrepor) {
			var urlIncluirDeclaracao = "https://areadocolaboradordesv.unimedbh.com.br/portalrh/conector?" +
				"ACAO=EXECUTAREGRA&" +
				"SIS=FP&" +
				"REGRA=456&" +
				"metodo=incluirDeclaracao&" +
				"qtdDeclaracao=" + empresasPagadoras.length +
				"numCad=" + crm + "&";
			for (var i = 0; i < empresasPagadoras.length; i++) {
				urlIncluirDeclaracao += "dadosDeclaracao_" + (i + 1) + "=";
				urlIncluirDeclaracao += (refIni +
					refFin +
					empresasPagadoras[i].cnpj +
					empresasPagadoras[i].valSalarContrib +
					empresasPagadoras[i].valRetencInss) + "&";
			}
			urlIncluirDeclaracao += "USER=webservice_INSSCoop&CONNECTION=" + acesso;
			return sobrepor ? urlIncluirDeclaracao + "&sobrepor=S" : urlIncluirDeclaracao;
		}

		/* Fim URLS */


		/* Busca dados iniciais */

		$scope.getDadosCooperado = function (crm) {
			var urlAcesso = "";

			$http({
				method: "GET",
				url: $scope.getUrlAutenticacao()
			}).then(function (response) {
				var acesso = response.data;
				var urlGetDadosCooperado = $scope.getUrlDadosCooperado(crm, acesso);
				$http({
					method: "GET",
					url: urlGetDadosCooperado,
				}).then(function (response) {
					if (response.data.falha) {
						alert(response.data.falha.erroExecucao);
						$scope.desabilitaEnvio = true;
					}
					else {
						$scope.dadosRetencContribPrev = JSON.parse(response.data);
						$scope.tratarPermissaoEnvioDeclaracao();
						$scope.dadosRetencContribPrev.dadosCooperado.fotEmp = "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxMTEhUTEhMWFhUWFxgYGBcYGB0aGBsaGBgXHRcYGBcYHSggGh8lGxgVITEhJSkrLi4uGR8zODMtNygtLisBCgoKDg0OGhAQGi0mHyUtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIALcBEwMBIgACEQEDEQH/xAAbAAACAgMBAAAAAAAAAAAAAAAEBQMGAAECB//EAD4QAAECBAQEAwYEBQMEAwAAAAECEQADITEEBRJBIlFhcYGRoQYTMrHB8EJS0eEUI2KC8TNykgcVosIWQ3P/xAAZAQADAQEBAAAAAAAAAAAAAAABAgMABAX/xAAjEQACAgIDAAEFAQAAAAAAAAAAAQIREiEDMUFhEyIyUXFC/9oADAMBAAIRAxEAPwCDEppFVzfeLbjBSKlm+8efDs7GJY4JjbxwTFgHYMbJjgGNxghuV/6iY9X9n0kgAXjyrKh/MEeq+zGK92X6RLkMh1mWFQjSqZUgUHWFslfviyQG5NEmLUqdMBWDpv0gTEZgqT8KDpNlNUcwYl2U6H+Cl6SXZwKdY5xeJSFI2FewP28IsPiZqlg3Bq4NjyI5EbxL7R5ilEsj4VX6dW+fgYyQGw3Os9TLSwor784T5PiV4lSkiyRfx/eK/gFTMUsIS5c32DRecsw6MNJTXi3Nne3esF0gK2L88my8NJZN6ml7XPZ4rUzEhMpCtykMDutzQ9vWN+0czVMLuwUnrQmyfvlCbHZg4SkFig6QncG5L9C4fZxBQGFHFlTg8S1LIc3DbAchQd4Z5fJI0hVGWEnpRwT5jzhfgpIloE9L6iVOTZIGqvWlY4k5spSDprMU5a34aHwA+UZ/BixzSnWSTRJc9QwYvt8RifArkzE2qEa32q4EIsPk01UwkrIGgpQdg4023YE1hwuShBNOEJTQbhIcJ9UwjfyEFxmYyE9wXPlSEmcZvO1LIBYJHrWFEpIMwpWSVBRUvkRybpFwyyZKKdCjr1cIG7tTwilqItNizATlhPGCdQck3cwFOw6CtlEs1/6txFjnDSkWVMDuBatoWYvAFWpgEqBGpaqJS9ann0EJlsagHAFQUQOZvsOkME4mZoJdkpfiVRPfr2DxFh58tDe7Os7qUKGv4Ub738oIxMv3qXL13UbAchv2EBvew0IcRmUtA18UxT01Bkgm503PifCAV5pMWNa30i1L9ABQDtBmYIQkhIQ7GhIck7q02A6l+jQLLwqyXK2O5Llht0iqqhN2F4VFnSa8/oDDzC4FKiBVP9sKsJKUBq965HOo9YZy8epmMI78KIbLQiX18ICnZiTShTyMQHHHeBJ814NBRudOewaFWYil4NK4X45T0jIYV+6jIJ0xkPkJiXfG7xUc43i3Y3eKjnG8CHZNiKOTG41FxTYiWWk7GNy5L7RY8iyJahqLtsGvCt0NVnOQ5WpZC2tHpOU4fQGDPy3hPlSEy1WCRThNQ/RoZZtmQbhTXmKDwpHNKVjpUE4iddylLUuyvItSAMPOGoutKiQ4b5s9DHn3tLnEx2UonkCbQhRjZr6klYbcUh48dqxJTp0ezS1gnWlkqFFUofvp3ige0mMWvEiWS4JDdQfrcRJ7L+1qtXu8QRWgVavXvDA5MJuI1AOUpLdyQR8jA/F7D+S0WLJ50uWlPugPxHw/y0EY3EppLWoAkEprWhueTDSf8QFhcEEJSeprtT6M8DZnMHvVJUColISA7PVnVyrtu3SkkijYsnT9R1y9JYG568NfPnC6RhffYh1IISAq27k6S3U6R4wYpJBcoISAXsK0ZPUVLD7JeDwiQxJIKSCWoNTFglv6m8+kVWlZN7OsRPIlzJSUskgB+ZJCbWbSAPExmEytKFoWANyQ+ylAJAB5ADzMTKkqUVa1ByoClgUp1dHfnzgqQkKcVClBKq0IZVe3CBE2xqDZqixcseJmsHFIV5pj0p4lfCxt+YOz+DBu/gbNXwhRNQPs/KKP7U49PEhT2BHN/uvjAirdBlpWJMwxeqYo2BIJG9mv5w29nsWNQAc361FgDt37xV0THIEWjI8GtYawNQWIA6ks+1heOqcUo0c8HbLJhsQEa1Ehgp9KalTDdX+5/SO5zT5agskIBo9HcfhH13aNKQQkJFALa3DlyX0XJ9YXox6uLUy+mkvTpZIcWA7xCitnWZgI0JkgOmjkOw34bVY1LwDhsbMM3SKqVQqVt0EOJc8LRxAJKU6lqZg+wHQCFycLpm/FRI1dya/WBfjGGZwctIc8SjvuesLp2DCm5Dc0EFYGe5BUHf5d94OnJEwcO2wDv1b9YCbTCJ5GFQFcKtXy7UhxrQw94gWuKQvxCVIUNTJBsm0FpxbhmBH3aHsFAOOCLpJ8YAUqJ8XOQTYwvmTOUOMjJs6BTUuY60F4kKQBAYV+yAq6RqOkyiatG4NITJlzxu8VDON4t2N3ioZxvGh2IxHEmF+KI4mkDiEXFHWAwDkMQecW2RlcwSxpWU+o6doW+z6ACNxeLKjFkqZgx26dIhyS8HihYMqnqJJUKC5v3pC32ilKlIczVFR2/aLrl6HRUVBbnaKlLlDEZlISo8HvBQ8kkU84nFWxm6Q2yL2Aly8N/GZirjUnUmWdn+EEbkxUcdhHKiwSH8o9A9rs0M/EFL/y5Z0pHa5jzP2tzI+992mgSz9z+0WvKVIjdK2cZl7JzvdGfL4kpDqTuBz6xaf+neMVMAepTwnnQOD9IUey2fTCVIClEBJclmY0aHX/AEwwxEycQOEK8Kg/RoHLVUbjbssebzAhCWpcgGzAUd7bl+kVebiyTpGlbsSGY8Ve7itnNNhD72nnjUtq7AM9QAOz/E1IqqJ/vCaFQJIcAlkuQfEAgAbMHhEtFGw7DJU/HVkhLAcVL/Fen0iOZmAKnBUwClhKgE6iksln5F/NPIxHNmFiEqcuSnoNIdzTSSdXFtwxzKSJqg7EBNm5llNyAUgKbrGYESylhCtIHvTuf6nSapsK6z4w0UXKFPXSX66iDXy+cC4BmQpqXD340jfuPUc4YYSSAH33fwt4kxNjoX5rm4QFJA+FJUelKD18o81zPHFZcpYkD7HpHpGc4QTEl2rTu7P4282iu4D2YeZrmsqvwpBb92t4bxTicY7YvIpS0hR7OZHMmqCtPCKuaA9uceh0kJEwy6BJcpIASOqidQ7D1jFrlSmcgUYAMAB2/UQpxmPlagQvjNH1O3SnCCegHeBKbm7AoqOgHOMeF8SSQVnmGuNykrU9qCFKJpCy6ynmlL1bnYCHeK4lJKVC/EndQ3AaoetYHmZaJgUVSzK5AAaQB1Yttyhk0gNA8rEyyUoZRDurWo6TycVKu1od4uWglyQHp4bhhUnp1hKnLUpI0ErHlpPOo4h4QbhzpqoTHsXYX/KkVrzuYWVeDRv0J1ISCSaqFjdtksN+m0Mslxw0EsWNA9LesLMPLTLdRQA9ADTwFy8bl5ipISNA1XCEiwNh07mEoYZ4yUhRdaVKPIW/WOESkX0kDxiXC41RTYFVr0B5AC5hNmMxeokuH2Jf0FoMVYTMzw1eFQ7GFRltcRKmYbX6QZJwQJqWfaKN0FC1UakYQzFACGOOy8o/284hwWZJQoJQHWafvAXwaT0O5eDloASo1F4yBy25cxkKSsOxu8VDON4t2N3ioZxvFIdmYkENMoklSgNOp+kLpIrFw9mkJcBjFxR3hMOUgVSCLDY9GgGbiqkOCb8NzDfMpSqWI58u8I/d06gniHLl07xzSeyi6HeT5mlXwg1DVPrCKUv3eIQp2KFkE8tVQfNoEUTr4CQb6XZzuAR8jB8+T70KYMoMC5oehaB0bsMzFZStzu5fvFQxmRzMRiVEUQWOomlqtzMPZeMWB7ucklvxG7Dn+bvBcgoAJCwewP6ROMp8bFlFSVAkvBJkI92ip57knnF89ncvGFwwSzzFOTVuIjfszRU8oUJmISEpKkoLqNrVZ9jaLNmOLLM4ALAj+4esNT7YYIQZzPdQQlmDAgUsSNTkUNj2MKvhISGrel6Cjqsad3SIb6AfhdQDcmDWsPny7RDOw1H6Fn8Re9iCYZSC4gMohIcpOkuA9Q7gp9ALgfh3BYjCy3UBpowQmjNZabfC2pomweGBJBTQ0Z/UcuEDl6Q4yvBMzl2UO7MWrvw06sIVsKRNgsr4KtXUDRrUDcrPEk9LB7dfAO3j9ILmz0pFdn7EG463iq+12eplyyAXUXYfU+UKlYXoB9pM6RKBHg3z+oinYjOMTNDJ/lo/po473geRLViJhWskgff2IdDLSQwEW+2GvSTbl/CuLkK3U56kmNypahVIduR27UPlF39nckw6pumaymu53MWfO/YTBS5fvUTfdn8ru/YRVSdWTdXR5pl2cKSoUQS4qpII8Sr9ovuGX7yXqQkbuwLg7socQ8HHaKBmWCYkhj9R1gr2fzBSTpJBT/Vt4iJySkrRRWnTLXMw76RpBe5CtjuUqDO/OJP+2u4ZIYOFaeJx2PqI6w0/VxBNtiq39SF3Y9XD3iQYhKA/u1pVqBCk18SCA9rU8YiyiFs9KCRqYACwd/BS6l+cRyZIQp1GX21Oa81dBDTEYvUKyyqXuRw1pUJLN5tAEyWUKohQBB0ggEDx1U57RjEuGRshqltTFvCIc30S6TFEq2QCAPT6xuag6kK4y1N2c+njEWbyC2pRS2zfdYK7CLkqDuKRFOxSkqeO5ctg58IklSHWCWa5h2xvA7OyteGDE7PCLK8MEAzFXNBF7kKl+6JVQAbxS8ZMFAm36wsHqhJk/wDFxkABUZBI5Fxx28VDON4t+NSa0iq5nh1k0ST4Q8Ox30JsJJKiI9DyCWoIDgCKXgETEqbQod0xc8BiQlHGSkxVsUlxmMIWZarEX2Y8xCbFYYBQ0K6mtR+ohjn+XLmaVyyh2FSG84T4gKTwrVrIBIrs1QGHlEX3ocHmqJYgsDwq2anSnOJfeEKSQogpFwQzh7h2/U7iJpCU6ChaCKvwu55OHtewiZODAGouNIatHIZqht+cYBYcJnUoo1TACWqE1HZ+fSEi8QvEzdKR7uWC5ptyBsT+hiBCFLVqW+gk0dgXa3IXr0h7JlJSkE8IHwjdmN994GKjsdNy0HYchCGQNKXLmz/ZgKbPqQB3N+/30gfE4gm1tiGvESZtj9PnT5RCTbLpJEyl6SDYWNhQ7H944mTgbHr1fYjrTZriBJ864alGvbau+0LsRiw9DTmwvTz/AAwYoWQ3k47S5TtueVeQtRr79IkHtOhMklw6Qd6ukENblv8AWK9iJzoUX4m2oX7Do/2YpcxZ1EVFft4vDiUjnnyYl7xntSZgJtsOzNbn1ioZtjlrZy/KCslSC4U3ck/fnHOa5WdJUmuk17HlFoxjF0TbclZbfZjLR7lJbaG6JYBoIE9iMUlcgJ/EA3WlINxpKFW/WPOm/udlWv0eaTMepM1ZYFWtV+5i45TNOIl61vwpAHJ7kffOEmc5AuZiSZQGmYdROySfifxcjvFuwWCTKlCWirC/Mm5PjHXyzi4KiEU09iOdhaH78or6yqXNISKlmaLzMl6RsKVNPWAsgyFU+cZxDIFid23EJxyq2WWzWS42oCqXA1UY8gbjtbpDXD4hKaMnSaWIFX+E2u9LdBEmb5NqFq7gbiEnuEyqTHZ30sSABuCOIevSFtMo0TY6ZdAWRWhABA5jhNDG0TUhLhXvGpThUL1JV9Y6wxQeTsdKlEE3oFHfxaNokqKitPCGYNZw9dLM/V4Ip1MmgIGoC7JBbzLGsbxErWl3FBQAfbCJZEosfeAH+qtz0UREGvQVpWpJejguYAUJZ85j2jUubZzY0HOBMyQUm7g15QBOxTUSKxZQsVzLRPzEEaASdyNoS4kl3MS5c4lktfeBsQqAlWgS2jWqMiKMjEaL/jcQrnFYx+MmamCj4CLTjJksfhJ7xWcxzYpLJSEjoKwY9lmHZajEFiwP+4/qINzadwaVIBV4QnynM1LID6hyNPlDvG4ZLhTB+R/WGloy2K8N76Wzin5fnfeJBhytblmo2x9IPExKmD6SPGDVSkaAQ2o7DduYvE7t2MZh8LpHCSS1a9bk846Xgg/EnUL77C4LMawHKx0oErJUoUAuA52A39Ys2CwxWjUoaQelfIws3iNBWcZLliCg4id8CHCJZfiNHUQdhSln7VUZnL98oq1EF9rdB2tCnN8wXKny0pcJStmqxQstMHW5MGYjFaFaereULLkkoqivHxxbdgM/BTQbgh79H/SIpjoBKrc/2g3G5mlCdS1BI5kwqxGLl4hB0LCm5GDCVraBycdPTAcTji5AOx23F3O+0ASp+pQGw8bUevXnAkxKtRSoW+kSS5JIoLfdovgkc+bJpc0pWCaP68h8oEzHC/zHDFwFOG37HY0rWm0OpWXlQTq1AP0cVvdxc3aNZjhCFUJUwZ3cVsAe8NFpMSSbQow8h7Pz8Pt49K9mMDLnSyhYBdIB6uAX6U+YimyJZDAhw4LgAg9Dy2p1h3hcWZReWS1BrCXpzIPe9GPMFoTmWS0HieJvGZPNwU73slOpG7erjY2rBCvaLCzBxlUs8lJJ9UvSIsX7VzEliA5fU6eQJFyOQekRqzkqISZCFF6/hYs+mr3qwoNg8c8uPLclspa8OBmEgHhmuH2Qon5QQMwKmTJkzFk7ngT5mp9IjmZqQlX8lKVAWoXFWsxdmpygb/5TMLBICabELYdErWO1IKgB0P8AAZMVcWLXTZABCR3pUw8n4qWhICAUgD8NAR0flzilTc6noADpU7uEs4HNQJURewEDpzBf4kKYln1KAfapVw0f8MHFhtFmx+ZI1anFANTOPMb94U40CcK6dFWNieX4g/kYElY1JfUpQsygoqJPolRptBuFmkgHWkdC5V0cEADxeBVBKxmMheGWChRKTsQdm3btFmyPPBOSAbMXTW/K1YWe0gSoAlwoUCqn/wAk2Hdor+VzglTaiO/EPT5xbHKN+k7xkegysIydLUJ1VJZjuCYXZiliVIch2qRQj6RhxvBRiQOYII7NeOZc7VUu7UJNB0iaXo4BjsLrTUubgtQ9Ir38PxMWi3lVwQwIfk/eFM/DgEOL8orB+CSRzKmaUaWhZPhjiEMIXzYFGb0RgRkSARkYnkeh4iV/Q8LJ+FU/+kjxH7RbZKUAPMOnp+I+EZ/3JALS5QfmoOYolQ9lUwsgg/6Ms9k1ibMMSUisl+XCr6GLFicfNa5R5JgBGPUs6TPWTyCif0EBmQt9m8rViCpcxCZcoPXi1EjYOotDHNMdh0DRpPCKc/8AkxI8IdHAnQPfzCl/wi5HVresV3M8BICSVLp1Po8QlJWWjHQswmby9aGkvVxS3UlnHlF4GJSQDejgD9YrOBRhgEEBFqE+jCjeENpmKTcHf8NH7kxLk2VgqK77VAJUiYwbWl35PV4SYjMdc0NzJPl+8WX2hwwnSFixam1dh1jzQTSCNjbrFeGKlEnPkcGb9sVlUxNXDUGz7mAcpnzpKtSEuCKhi0WbIckVPWFKHDVqd3IcdC3WL5g8rlSkhgkU3ZuVyPnFJ8y444VYi43OWd0eaIyzFz16ikItTdtmBuaw8ynKFITpmB9y7eVRVg1RQNWLspCBwsQeo70LXryPzgbEKZJNHffnZ+G/VQ8qPHO+eUtUWXFFOxHJlJSs2PhQkvQhg3QhyHMdzsOJiKqsHber3owJ370jn/vcoEoUqtWDqZm5gcQ7V2vEUzHpCgtNySQUkDk1A/J2tTwiisk6B0yggggC7cQJTVt25Kc/5guYtSQZbgO5oeF0ipSyXs9uYs0CTsyQtTFgoNR2B2HEbM7MDsYk94NL8RalQ76hdwW8VdLxTfolICzDDF1F0tY6dJo3ccv1geShQSVhamcEAAMwo5YMDS3SGMxCZg1ghJ+FRIAJAYpILFj1cF4BxB92UlJYksRQvdi9CFbQ1i0THFJP4kKKSWIcuosw5CvhEc0nUlCnSFPxUCXa7mzeMDzZimJLaiOdS1qhTUAvBWG0zEFSklZLmja+rAghxSrwKDZzh8I5UAoAjhClHVRnGkMGuIjVJPxJmKTp5uA/9zEvGe5SC8sKIIsQpxWhuPQm0OpCStFQnU3wm6uqVEnpse+8B6ChX70gpBWFblg70/Eklx5te8al5kQC54i/+mQHHUF4NTlKtSVE6k8mDilqEnygbEZSlaiUp0iruQ3pA+02xQnFkkpU9SWBAp6NAKJpSp9gd4c5ng0hIYVHWFC0DqfnFo0yUrQ/w+ISpI03N9+8FpUAwcVZtvMPQxWMLiQk0cQ0ViacKSQd+XlCShQ6lY9U6WcdOh83eBsWkO4Tp5COMvzLUnQoEt8J3/eNYomhpXlCJUxn0CY5YakK1Kg7F1hesQ5Ptm9cZETGMgBxPVpuJlAuSZqv+KP1Mbl4iastL4RyQlvlUwwyz2fT/wDofJPpfzEN5okYdP8AOmpQPyIufBNfMmNbGpFeOUzSQFaR0UXV/wAQ6olRkJlnW5DVq0serqPgmCk+0YJ0YSQe5DnvpTQdzGsWrFLDqniWkX0gEjuoMlP9yhAsJxiMJ7wOtSzu4GkHspdT/wAYU4zKkEVQCNyuYo0HIDSn0hxgtK0kiYuYkXmrU0sc2UQAo/7QrvCjOcKn8KlLF76EAfM+YiUrRWLTAhgQSpaGSGYVUfU1Hh5wsXhlJIBJUOYBp52hphsKdlDiq1qDws/ytBicPpA1h32/WFdjqhUsKSgnVrewLAVsDz84rCcKkzlkp+zcsRFgzXEoSCQbeHkIrmV5prmLTpuKPswLt3rFOOLSbJzkm0i34LMwhAcUDClRSxDVG4gvD5ilbkKbbv1Y3++kVmdLOngDjVUcwx9YFxU+ZKA92DWrNQEP9+MQwstdFozGavQ6CkkAlJYMRWjg0p2NN4rqM/VLH80mrUoWfk9SPK1XghGdrEvUvSH5s3Zm78vCMxeHk4sJKQAR1FrsCA7dNoeMUvyWhJNvoCn5TKWROCghLl7tzNBb1ERZpgZiEhUtWoAfECWbYCrNYARFmeXzJY/k6hSqTXZtg1t6eN47yTGMnjWUsGcuUMNyHsbHzpeLpurTsi0rqgBYEwETE+7UBQjhPkXcVHnDXL0Mga2IIPw1rzNGFD1hnpws8Ea0BbOQzpfmEuAKF3FxyuIJmTLwqFLCtYFQkJcEFqh3auzG0HO9AxrZFisOTQkreqV0e3wlKbGg3t0gadJOnQzqPEkLWxHkS/iRDORjJMxB1AVdJJVR9zRyKc4gwyAxTqA3FSp27/F8+8LbQaRXpeN0gomIYGhJdqHn9awdJy8KGuXMAqOE3HJlpFRycDoY6xmVoIZJvem/Rqkd7QnVgp8lWuWFU3SX7v8ApFE0+mTaa7GGZYabLew1ci9RVyCHB8Hg7LM6K06S5WkVcgO24J37kPXeOcp9pQGTOSZfNSU08UW9PKCMSnDTFOkBQO6Rp+VH6NCy/TQV+0zU/PHdOoF6sU8QPJ7eY8eY03EzVJ+Jkq5g03IiVKJSBw6VB7/qQ4fvEmEBU+jvYN1pC6Q22C4HFirjVzs37eUDZhLCiShJJ7MGjJuHVLUSUJNeRH1/WG2FxSVJolQU1gH+loa62he9Mq8gOtlBhDhRoEUO4V9CPrAOPW6ioDuNIT8hBOEUlSH1AN5+Dw8tqxVp0GycQWBBOoebeUET0uGfivW8Ae9UK0Ia1AY3Nnmg6UaJ1spZFNQeUDKRE6jvESo0mKaCIyO4yFsJ6lPzmfNBEoe6li6yQP8AyNB2FY4kYJCRrXxk11zHSk9Qn41+ggLE5gtSgmUgkiyiASB/Sn4ZY636xwgJTxzZmsnqSD43mf2sP6o1jDZONK+CUgqA3I0Sh/Ymh/uJJ5RxjsTKSHWr+IWmyXaQk/7RQ9rQgx+crUNKRpRZhTzangKd7xHl3ElTuYz6MuwTMMxnTZmuatwKAAslI5JSKCLplpE+UlwQGvZwNwD4j7MVSRlgl8cwUNUpL1D/ABK5JegF1HkHMNsozUlSmUAxSCTW7mjAD8IHoKQe0HobLy9UtKjpqosOiRsPFvWKzmmImLJSBpGo/wDEAN51j1LAJC0Vq9IqntDk51KItWm37xkqM3ZRZuG1PqF9yWHl994Try9lEgVG7N8otS8CVMDsX/Y8u/XylVl5HU9O9fkYKmBxEuXgg15aiOo4fBgD6Q0mygASBanRw1D4v9mAJySFnbZ/E/T5RJh8woQer96NCTjfQ8ZUbm4eXMFiE8q79rsej1gf/tWmWVS6E2KfGtBStxUdGsdPl6k8Lgnl2Ffl5QtkTlytRdw7Ec3s+3MOeV4RWOwDCY+YlRE6mwsA+wL8Pj22hmj3c59J0l2IZj1dwytq+nLuXNlzaFWltjVwbXr58ukLTk6kqJllxWj/ACCrBh6eMNp/DF3/AE3LyAyVObchTnvb7I6Q3yDPCWlzCSlyAFJDdizF/D9x8J7RpQ6JoLJOmr0PiX2L9osWHElaXdCgoWNiDYgmhcP/AJgSk/8ASMkvCHN8qlYga5ThY2RUEC4DsQQdh06QjlS6c+akgbfmZN+8NpWTTZcxSpUw6TY3YcmO4sdukSauIiYAmYX2ICvHcwFLQGti5UkLHMc6fMRDrSmjEjcXPdt4Yrw6CHqDzH15wrxEnQXYqHP6xlswDjcMiYH0seg+YaK3icIpJ4XH3yv5PFz/AIpP5SodA5A5tf5wNOKVhqP+VQYmKwm0TlFMqWDn8V2VyO/jfwMPMtzwAsqni4fttHGYZZSnKxq3Zqt4QtwcvQXmICkfmBcA9VC3YxV4yRNXFlgxWYSiDqZzuxIc8xt3hrk2GlqS6QnfckfKkI1CTMA0Ok2Y2PiNocZBgVIoCx7v/mIypIorsTe0KSQXcEFtiPA3hHgp2lxaLlm8pYBCvdl6hxTx2EUnGIVLVxJY3b9CLjrFeN2qEnp2PsPxcTCjCtvCNKUCosWPJmhThcUXbaDEoe142NM2Vk009CIHKolWCIFWqsIMT6oyB9cZC0Cy7Y7PUgFKGbl+HuQarPVVOkJjjFqVqJJfeBcPhVGpDw+wmBGl1NFMUjW2RS12oYdZbKCDrWzNRBo/VXIMCew7OCiSAQdLk/An/wBj0gjGDUlhrI/Nz5k9z8hyhGOiD2gWqcCUlg9xubPSwagGwhPlhWhWjUaqBO54QaB7XqTQQ6yyh035AmvkY3nCAElKAHPxK59B0+cBSoLVly9l86BKZYZTJDrskOHZI3veLdj5CVotHhuW58ZM/hQtR238Al/vpHp2R+0fvWCyAeTuezC3jFPBCKdk/E7U5/e5gLHYZl89vOLniJQUKVhDjZVx1ibVDp2UPNsCXo4c+n2TCZWFOlnsznsB+sX/ABOHCg0IsZgWVqZw9uXSFyHqxNInKCX2/Rw0D4lSqsxFCQe9R6+kPpmXhaGAbftQwNjMsKQ43FY3YOhNhJCJjoTRT6kbF6Okc3p4gc3LDDzVpCVaQQmhIuDtTkpvP1hGWrOo2IILjY1B+Y9Idy0KRxqGoLDLHP8AMOj/ABDke0BoKYN/ASZ4Bss2JssfkU+4dgTaxoxCyZ7PzcMt0E+7Jo1W8DyLuIssvDe7WxGqWoAhqdlD8qrjuCKw1QgkBKuIH4VN8Qs7bLFiN7flMZWBtCfAawAUMo7oFyOco7/7PL8sEqUJgIWAUq8/B/lbtBasvA4ha9NnNFDmgnxBvW8y0ajpmDSs1CtlfRzz371Io1iOZhShiCVoNnNR0c/I+cLsZJVUtQ+XlD7EpVKVUUPOxa47+o6QPNWACtFUj4kGpHU9P6vlRwEoOYzloX8OjkoVD7FtxAys3WlveJCh+YD0PP5xfDJkzxpSUhX5FNX/AGKPyPmYr+Y5MUunQaGo36s9+0VUl6ibi/GKRjpaxxApB3H73hXPlTEqdJfkpPyJ+hiSfl5QSwLcjygvCSi1jyMUtR2hKctMhy7GgFzQ0cWf94ssjNpYDgkHmbP1Z2hFPy4XoedYEnYRaapfq31H6wGoyMsoltzHEqXLfSVDmkgnwaK0pljSSZifyqGmYnqkn5QKnMFtpIbtT0glMyYr4qgbm/nDRjiCUsiAYEoL3SfhUzeBGxhlIlUjcjF7Fyk3B+/WC0ymHDVJsfveM2ZIEmIgOfKEMkh4imYaIOVMvhaEpQY3DM4WMg/UQn0WW7LMvCA5jrEYhIcqTQevSC9qQn9oJqky7RSQEAysy1TCp0kmnYcgO1IPGJpRbRR8NPZbhw8WiRMTpqHPWBONBi7Mm4spJIUknmwduQ5d4KlZyggBRDnokfOKtj5RWo6Ut1tAJwZBZUwA9KnzhlFNCOTTL1MkomBjNCejv6CkG5ehMkApKiOZb0SKfPtHn0rErFJaVd7+kWnJcSsgCa7tv+ghZRaGjJM9c9l85E6U4BYUc7ne94MxEkKqkuH+XLxjzAZmZYBSSyRwpFn5tzizZNn1EIJqBxD5knwMHTRqoZzcO3gICXJe8NDPQpy96+g+kLp08XFi7QjiNYEMPpPSNmUDQxqbi6A9PrESMWDaFoJOjDDlt/iJEyRZqG3cW/Txgb+K+hjr+JuHtBBRPIlunRyPD35eIYdwI6w6gHB+E1I5H8yevzhfPxoBcG4dvn6v5QJj80U2oB3oeiv3FfBXKBYaLJ7zTv1ChW91gbg/iTvdnBgfE6SFAggJqpIqZb195L/Mg0JH+YrGDzvV/LK9Jd0E2SvkTsk2PIsdiCSMy95QEy50ssBYoW/wn+hRs9AosaKeMaqGE3E6f5c0hSSAUqPwLFhxCo6KumxpQJ8weUfeJJ0gs5+JBP4V7VFj8Kh5RErM0TJawpJ0pczZSaKlkfFOkpNQzccvZuVUJ8RmhlLCFqBQUvKnDjQZaj8K0/8A2SSXBSzpL0BBByjYG6DcQmXOcywyxUoG/NUvn1T5OKDuRm4ZKJ7rQRwTB8Q7H/1PgRFezGWpLzJHCEgKXJ1OUCmmbLUPjlGhCxax2J3g80E86FqZatxQLOxr8E3/AMV9FfE/02DJD7GpRpBcLQSwWLP+VT/Cr+k15OIVzdKQdJBHI3HhuO0JZ2LxGHmFNFBV0qDoWl7KSeviDZrxLMwHvwZmHWUhIdclRdSOZSr8aOtCN+ZP06Bmc4jHqQSGAiOXjH4k3PKnoXEd4bATD8RpyNR4ftE+HkJSSEptvUehhrSFpsHQ6viH6xKVABgYkWsWLP5P47GIVSi7qpBsFEkgUfeG2AmBiDY/bwnmLaxEMsqOoXhZdWFdmvhUQfAwSljAmIPE3kY5lzmvHPyx9R1cM9Uw/wB2IyBhPjI5qZ0WizYk1AELvafDrEtwdo3GR3ye0cMUUD+PUCygD4Q3y/EIHEa9P3jcZFpJUSi3YVNIVWofbeK/mOEANSR3rGoyJwdMea0by6WuyZpHSGMmXPTXWVeI+ZjUZDyYkUO5E1QS66E+PrBsrEUDUfzjUZEXoqhtLx6xwvQBjzgqTmDsBtSMjIFjGvfBQbr8hEK8QEqDUd/WMjIAAWZmQBbpTzgLHZsdYYkagA/VQ4Sf7jGRkMkZi3FZoVo1JLLSajYhVPRTeZgfL8/CgyidJoq5I5K6sWPZxvGRkUUE0I5NMBzDFEFSVUKSUndiLh++8GLxylyvfAgzJQAW4+OUSEDU/wARDhBG6SN0xkZGUUgOTZxmM4rQnGSVqSuWxUp2UyShIVq3UkrlpJPxJWk3C4lweIl4iSslITLSQZyEj/RWuicRIFtCjRcryskoyMh30xL2RSUqkLMqYooMpTpWni92VB9SX+KUsHilm4JoC4MuY5Mk61BASUECbLB4UlT6VSzuhTGl02sxjIyJtsokH5WgYhIlTqrDaFmpOwCjzsNW4obAgQSDJWW4VJLgg1BjIyFbCkMRhU4gcPAsVUkBklrqT+U8xblygHGzBK4VEkEUUL+I3jcZGSt0Z9CqdKKmU7jmKHxEQnFsGLkC3SMjIpHZN6I0r1FxblDDBTSDSMjIMgRCMVNJjZS4eNRkSl0ViyIyzGRkZCD2f//Z";
						$scope.carregando = false;
					}
				}, function myError(response) {
					console.log(response.statusText);
				});
			});
		}

		/* Busca dados iniciais */


		/* Limpar tela */
		$scope.limparTela = function () {
			$scope.refIni = "";
			$scope.refFin = "";
			$scope.empresasPagadoras = [];
			$scope.anexos = [];
			$scope.liEAceito = false;
			$scope.empresaAIncluir = {
				cnpj: "",
				nomeEmpresa: "",
				valSalarContrib: 0.0,
				valRetencInss: 0.0
			}
			$scope.ArrayArquivoEmBytes = [];
			$scope.somaValoresRetencInss = 0;
			$scope.filterEmpresa = [];
			$scope.hideEmpresa = true;
			$scope.desabilitarCamposEmpresa = false;
			$scope.desabilitaEnvio = false;
			$scope.carregando = true;
		}
		/* Fim dados Tela */

		/* AutoComplete */

		$scope.completeEmpresa = function () {
			if ($scope.empresaAIncluir.numIns && $scope.empresaAIncluir.numIns != "") {
				$scope.hideEmpresa = false;
				var output = [];
				angular.forEach($scope.dadosRetencContribPrev.listaCNPJ, function (empresa) {
					if (empresa.numIns.toLowerCase().indexOf($scope.empresaAIncluir.numIns.toLowerCase()) >= 0
						&& output.length < 10) {
						output.push(empresa);
					}
				});
				$scope.filterEmpresa = output;
			} else {
				$scope.hideEmpresa = true;
			}
		}

		$scope.insertLineEmpresa = function (empresa) {
			if ($scope.contemEmpresaNaLista(empresa.numIns, $scope.empresasPagadoras)) {
				alert(empresa.razSoc + " já adicionada.");
			} else {
				$scope.empresaAIncluir.numIns = empresa.numIns;
				$scope.empresaAIncluir.razSoc = empresa.razSoc;
				$scope.desabilitarCamposEmpresa = true;
				$scope.hideEmpresa = true;
			}
		}

		/* Fim AutoComplete */


		/* Empresas pagadoras */

		$scope.adicionarEmpresa = function () {
			if (!$scope.empresaAIncluir.numIns || $scope.empresaAIncluir.numIns == "" ||
				!$scope.empresaAIncluir.valSalarContrib || $scope.empresaAIncluir.valSalarContrib == 0) {
				alert("Obrigatório informar o CNPJ e Valor do Salário de Contribuição!");
			}
			else {
				//Validar CNPJ.
				if (parseFloat($scope.empresaAIncluir.valRetencInss) > parseFloat($scope.empresaAIncluir.valSalarContrib)) {
					alert("Valor de retenção do INSS deverá ser inferior ou igual ao valor do salário de contribuição!");
				} else {
					$scope.incluirEmpresa($scope.empresaAIncluir, $scope.empresasPagadoras);
					$scope.desabilitarCamposEmpresa = false;
					$scope.somaValoresRetencInss += parseFloat($scope.empresaAIncluir.valRetencInss);
					$scope.empresaAIncluir = {
						numIns: "",
						razSoc: "",
						valSalarContrib: 0.0,
						valRetencInss: 0.0
					}
				}
			}
		}

		$scope.incluirEmpresa = function (empresa, lista) {
			if ($scope.contemEmpresaNaLista(empresa.numIns, lista)) {
				alert(empresa.razSoc + " já adicionada.");
			} else {
				lista.push(empresa);
			}
		}

		$scope.removerEmpresa = function (cnpj) {
			for (var i = 0; i < $scope.empresasPagadoras.length; i++) {
				if ($scope.empresasPagadoras[i].numIns === cnpj) {
					$scope.somaValoresRetencInss -= $scope.empresasPagadoras[i].valRetencInss;
					$scope.empresasPagadoras.splice(i, 1);

				}
			}
		}

		/* Fim empresas pagadoras */


		/* Anexos */

		$scope.removerAnexo = function (anexo) {
			for (var i = 0; i < $scope.anexos.length; i++) {
				if ($scope.anexos[i].name === anexo.name) {
					$scope.anexos.splice(i, 1);
				}
			}
		}

		$scope.anexosSelecionados = function (input) {
			$scope.$apply(function ($scope) {
				for (var i = 0; i < input.files.length; i++) {
					if (!$scope.contemNaLista(input.files[i].name, $scope.anexos))
						$scope.anexos.push(input.files[i]);
				}
				input.value = '';
			});
		}


		$scope.lerAnexos = function () {
			var reader = new FileReader();
			reader.onload = function (event) {
				ArrayArquivoEmBytes.push(event.target.result);
			}
			reader.readAsText(file);
		}

		/* Fim anexos */


		/* Enviar declaração */

		$scope.enviarDeclaracao = function () {
			if ($scope.somaValoresRetencInss >= $scope.dadosRetencContribPrev.informacoesDatasPermitidas.limCon) {
				var txt;
				var r = confirm("Confirma a retenção dos valores de INSS no período de " + $scope.refIni + " a " + $scope.refIni + " via outras fontes pagadoras informada?");
				if (r == true) {
					$scope.lerAnexos();
					// Tentativa de envio de declaração.
					// ver se tem falha
					// se tiver falha, verificar codigo.
					// codigo constante.ErroDeclEnv
					// Envia novamente com o parâmetro sobrepor=s na url.
					// Mandar mensagem de sucesso.
					incluirDeclaracao($scope.dadosRetencContribPrev.refIni,
						$scope.dadosRetencContribPrev.refFin,
						$scope.dadosRetencContribPrev.empresasPagadoras,
						$scope.dadosRetencContribPrev.dadosCooperado.numCad);
				} else {
					$scope.limparTela();
				}
			} else {
				$scope.lerAnexos();
				// Tentativa de envio de declaração.
				// ver se tem falha
				// se tiver falha, verificar codigo.
				// codigo constante.ErroDeclEnv
				// Envia novamente com o parâmetro sobrepor=s na url.
				// Mandar mensagem de sucesso.
				incluirDeclaracao($scope.dadosRetencContribPrev.refIni,
					$scope.dadosRetencContribPrev.refFin,
					$scope.dadosRetencContribPrev.empresasPagadoras,
					$scope.dadosRetencContribPrev.dadosCooperado.numCad);
			}
		}

		$scope.incluirDeclaracao = function (refIni, refFin, empresasPagadoras, crm) {
			$http({
				method: "GET",
				url: $scope.getUrlAutenticacao()
			}).then(function (response) {
				var acesso = response.data;
				$http({
					method: "POST",
					url: $scope.getUrlIncluirDeclaracao(refIni, refFin, empresasPagadoras, crm, acesso)
				}).then(function (response) {
					if (response.data.falha) {
						if (response.data.falha.status === "0") {
							var txt;
							var r = confirm(response.data.falha.erroExecucao);
							if (r == true) {
								$http({
									method: "POST",
									url: $scope.getUrlIncluirDeclaracao(refIni, refFin, empresasPagadoras, crm, acesso, true),
								}).then(function (response) {
									alert("Envio concluído com sucesso!");
								});
							}
						}
						else {
							alert(response.data.falha.erroExecucao);
						}
					}
					else {
						alert("Envio concluído com sucesso!");
					}
				}, function myError(response) {
					console.log(response.statusText);
				});
			});
		}

		/* Fim Enviar declaração */


		/* Tratar período comepetências */

		$scope.tratarInicioReferencia = function () {

			//Se o campo estiver vazio não há nada a ser validado
			if ($scope.refIni.length == 0) return;

			var refIniArr = $scope.refIni.split('/');

			//Verifica se o mês do período é válido
			if (refIniArr[0] < 1 || refIniArr[0] > 12) {
				alert("O mês do período deve estar entre 1 e 12!");
				$scope.refIni = '';
				$('#refIni').focus();
				return;
			}


			var dataAtual = new Date();

			var diaLimite = $scope.dadosRetencContribPrev.informacoesDatasPermitidas.diaLim;

			if (!$scope.isAnoCorrente($scope.refIni)) {
				alert("Mês inicial de referência deverá ser dentro do ano corrente!");
				$scope.refIni = '';
				$('#refIni').focus();
			} else if ($scope.isCompetenciaAnterior()) {
				alert("Não é permitido o lançamento de declarações com competência inicial inferior à competência atual!");
				$scope.refIni = '';
				$('#refIni').focus();
			} else if ($scope.isCompetenciaAtual() && dataAtual.getDate() > diaLimite) {
				alert("Data limite para envio da declaração do mês corrente ultrapassada!");
				$scope.refIni = '';
				$('#refIni').focus();
			}

		}


		$scope.tratarFimReferencia = function () {

			//Se o campo estiver vazio não há nada a ser validado
			if ($scope.refFin.length == 0) return;

			var refFimArr = $scope.refFin.split('/');

			//Verifica se o mês do período é válido
			if (refFimArr[0] < 1 || refFimArr[0] > 12) {
				alert("O mês do período deve estar entre 1 e 12!");
				$scope.refFin = '';
				$('#refFin').focus();
				return;
			}



			if (!$scope.isAnoCorrente($scope.refFin)) {
				alert("Mês final de referência deverá ser dentro do ano corrente!");
				$scope.refFin = '';
				$('#refFin').focus();
			}


			if ($scope.isRefFinalMaior($scope.refIni, $scope.refFin)) {
				alert("Mês final de referência deverá ser anterior ou igual ao mês ano inicial de referência!");
				$scope.refFin = '';
				$('#refFin').focus();
			}

		}

		$scope.isCompetenciaAtual = function () {

			var splitDtIniRef = $scope.refIni.split("/");

			var mes = splitDtIniRef[0];
			var ano = splitDtIniRef[1];

			var dataAtual = new Date();

			if (mes == dataAtual.getMonth() + 1 && ano == dataAtual.getFullYear()) {
				return true;
			} else {
				return false;
			}

		}

		$scope.isCompetenciaAnterior = function () {

			var splitDtIniRef = $scope.refIni.split("/");

			var mes = splitDtIniRef[0];
			var ano = splitDtIniRef[1];

			var dataAtual = new Date();

			if (ano < dataAtual.getFullYear()) {
				return true;
			}


			if (mes < (dataAtual.getMonth() + 1)) {
				return true;
			}


			return false;

		}


		$scope.isAnoCorrente = function (valorCampo) {

			var dataAtual = new Date();

			var splitDtIniRef = valorCampo.split("/");

			var ano = splitDtIniRef[1];

			if (ano != dataAtual.getFullYear()) {
				return false;
			}

			return true;

		}

		$scope.isRefFinalMaior = function (refIni, refFim) {

			var refIniArr = refIni.split('/');
			var refFimArr = refFim.split('/');

			var diaInicio = refIniArr[0];
			var anoInicio = refIniArr[1];

			var diaFim = refFimArr[0];
			var anoFim = refFimArr[1];

			if (anoFim < anoInicio) return true;

			if (diaFim < diaInicio) return true;


			return false;

		}

		/* Fim Tratar período comepetências */

		/* Verificação data de envio */

		$scope.getDataFimInc = function () {
			var split = $scope.dadosRetencContribPrev.informacoesDatasPermitidas.fimInc.split("/");
			var ano = split[2];
			var mes = split[1];
			var dia = split[0];
			var dataLimite = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
			return dataLimite;
		}

		$scope.getDataInicioInc = function () {
			var split = $scope.dadosRetencContribPrev.informacoesDatasPermitidas.iniInc.split("/");
			var ano = split[2];
			var mes = split[1];
			var dia = split[0];
			var dataLimite = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
			return dataLimite;
		}

		$scope.tratarPermissaoEnvioDeclaracao = function () {
			if (new Date() > $scope.getDataFimInc()) { //RN 08
				$scope.desabilitaEnvio = true;
				alert("Prazo para envio da declaração encerrado em " + $scope.dadosRetencContribPrev.informacoesDatasPermitidas.fimInc);
			}
			else {
				if (new Date() < $scope.getDataInicioInc()) { // RN 09
					$scope.desabilitaEnvio = true;
					alert("Declaração de Retenção de contribuição previdenciária poderá ser enviada a partir do dia " + $scope.dadosRetencContribPrev.informacoesDatasPermitidas.iniInc);
				}
			}
		}

		/* Fim Verificação data de envio */

		$(document).on('click', '.showHidePagadoras', function (e) {
			e.preventDefault();
			var alvo = $('#' + this.id + '_alvo');
			if ($(alvo).is(':visible')) {
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

		$scope.getInicioValidade = function (refIni) {
			return "01/" + refIni;
		}

		$scope.getFimValidade = function (refFim) {
			var mesEAno = refFim.split("/");
			var dias = getNumDiasMes(mesEAno[0], mesEAno[1]);
			return dias + "/" + refFim;
		}


		/* Varredura de listas */

		$scope.contemEmpresaNaLista = function (cnpj, listaEmpresas) {
			var contem = false;
			for (var i = 0; i < listaEmpresas.length; i++) {
				if (listaEmpresas[i].numIns === cnpj) {
					contem = true;
				}
			}
			return contem;
		}
		
		$scope.contemNaLista = function (objeto, objetos) {
			var contem = false;
			for (var i = 0; i < objetos.length; i++) {
				if (objetos[i].name === objeto) {
					contem = true;
				}
			}
			return contem;
		}
		/* Fim Varredura de listas */

		$scope.limparTela();
		$scope.getDadosCooperado(7007);

		/* MOCKS */

		$scope.param1 = "Se dados acima incorretos, entrar em contato com sua analista de relacionamento para atualização.";
		$scope.param2 = "VAI VIR PREENCHIDO {PARAMETRO 2}";

		/* FIM DOS MOCKS */

		angular.element(document).ready(function () {
		});
	}
})();

var getNumDiasMes = function (mes, ano) {

	var ehBissexto = ((ano % 4 == 0) && (ano % 100 != 0)) || (ano % 400 == 0);
	switch (mes) {
		case "01": return 31;
		case "02": return ehBissexto ? 29 : 28;
		case "03": return 31;
		case "04": return 30;
		case "05": return 31;
		case "06": return 30;
		case "07": return 31;
		case "08": return 31;
		case "09": return 30;
		case "10": return 31;
		case "11": return 30;
		case "12": return 31;
	}
}