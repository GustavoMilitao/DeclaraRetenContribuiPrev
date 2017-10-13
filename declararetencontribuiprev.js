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

		var vm = this;
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
				"REGRA=456&" +
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
						$scope.dadosRetencContribPrev = response.data;
						$scope.tratarPermissaoEnvioDeclaracao();
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