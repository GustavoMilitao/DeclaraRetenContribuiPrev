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
	function DeclaraRetenContribuiPrevController($http/*,cooperados,consultarCooperado*/) {

		var vm = this;
		$ = window.jQuery;

		/* URLS */
		vm.getUrlAutenticacao = function () {
			return "https://areadocolaboradordesv.unimedbh.com.br/portalrh/conector?" +
				"SIS=FP&" +
				"LOGIN=SID&" +
				"ACAO=EXESENHA&" +
				"NOMUSU=webservice_INSSCoop&" +
				"SENUSU=abc123";
		}

		vm.getUrlDadosCooperado = function (crm, acesso) {
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

		vm.getUrlIncluirDeclaracao = function (refIni, refFin, empresasPagadoras, crm, acesso, sobrepor) {
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

		vm.getDadosCooperado = function (crm) {
			var urlAcesso = "";

			$http({
				method: "GET",
				url: vm.getUrlAutenticacao()
			}).then(function (response) {
				var acesso = response.data;
				var urlGetDadosCooperado = vm.getUrlDadosCooperado(crm, acesso);
				$http({
					method: "GET",
					url: urlGetDadosCooperado,
				}).then(function (response) {
					if (response.data.falha) {
						alert(response.data.falha.erroExecucao);
						vm.desabilitaEnvio = true;
					}
					else {
						vm.dadosRetencContribPrev = response.data;
						vm.tratarPermissaoEnvioDeclaracao();
						vm.carregando = false;
					}
				}, function myError(response) {
					console.log(response.statusText);
				});
			});
		}

		/* Busca dados iniciais */


		/* Limpar tela */
		vm.limparTela = function () {
			vm.refIni = "";
			vm.refFin = "";
			vm.empresasPagadoras = [];
			vm.anexos = [];
			vm.liEAceito = false;
			vm.empresaAIncluir = {
				cnpj: "",
				nomeEmpresa: "",
				valSalarContrib: 0.0,
				valRetencInss: 0.0
			}
			vm.ArrayArquivoEmBytes = [];
			vm.somaValoresRetencInss = 0;
			vm.filterEmpresa = [];
			vm.hideEmpresa = true;
			vm.desabilitarCamposEmpresa = false;
			vm.desabilitaEnvio = false;
			vm.carregando = true;
		}
		/* Fim dados Tela */

		/* AutoComplete */

		vm.completeEmpresa = function () {
			if (vm.empresaAIncluir.numIns && vm.empresaAIncluir.numIns != "") {
				vm.hideEmpresa = false;
				var output = [];
				angular.forEach(vm.dadosRetencContribPrev.listaCNPJ, function (empresa) {
					if (empresa.numIns.toLowerCase().indexOf(vm.empresaAIncluir.numIns.toLowerCase()) >= 0
						&& output.length < 10) {
						output.push(empresa);
					}
				});
				vm.filterEmpresa = output;
			} else {
				vm.hideEmpresa = true;
			}
		}

		vm.insertLineEmpresa = function (empresa) {
			if (vm.contemEmpresaNaLista(empresa.numIns, vm.empresasPagadoras)) {
				alert(empresa.razSoc + " já adicionada.");
			} else {
				vm.empresaAIncluir.numIns = empresa.numIns;
				vm.empresaAIncluir.razSoc = empresa.razSoc;
				vm.desabilitarCamposEmpresa = true;
				vm.hideEmpresa = true;
			}
		}

		/* Fim AutoComplete */


		/* Empresas pagadoras */

		vm.adicionarEmpresa = function () {
			if (!vm.empresaAIncluir.numIns || vm.empresaAIncluir.numIns == "" ||
				!vm.empresaAIncluir.valSalarContrib || vm.empresaAIncluir.valSalarContrib == 0) {
				alert("Obrigatório informar o CNPJ e Valor do Salário de Contribuição!");
			}
			else {
				//Validar CNPJ.
				if (parseFloat(vm.empresaAIncluir.valRetencInss) > parseFloat(vm.empresaAIncluir.valSalarContrib)) {
					alert("Valor de retenção do INSS deverá ser inferior ou igual ao valor do salário de contribuição!");
				} else {
					vm.incluirEmpresa(vm.empresaAIncluir, vm.empresasPagadoras);
					vm.desabilitarCamposEmpresa = false;
					vm.somaValoresRetencInss += parseFloat(vm.empresaAIncluir.valRetencInss);
					vm.empresaAIncluir = {
						numIns: "",
						razSoc: "",
						valSalarContrib: 0.0,
						valRetencInss: 0.0
					}
				}
			}
		}

		vm.incluirEmpresa = function (empresa, lista) {
			if (vm.contemEmpresaNaLista(empresa.numIns, lista)) {
				alert(empresa.razSoc + " já adicionada.");
			} else {
				lista.push(empresa);
			}
		}

		vm.removerEmpresa = function (cnpj) {
			for (var i = 0; i < vm.empresasPagadoras.length; i++) {
				if (vm.empresasPagadoras[i].numIns === cnpj) {
					vm.somaValoresRetencInss -= vm.empresasPagadoras[i].valRetencInss;
					vm.empresasPagadoras.splice(i, 1);

				}
			}
		}

		/* Fim empresas pagadoras */


		/* Anexos */

		vm.removerAnexo = function (anexo) {
			for (var i = 0; i < vm.anexos.length; i++) {
				if (vm.anexos[i].name === anexo.name) {
					vm.anexos.splice(i, 1);
				}
			}
		}

		vm.anexosSelecionados = function (input) {
			vm.$apply(function ($scope) {
				for (var i = 0; i < input.files.length; i++) {
					if (!vm.contemNaLista(input.files[i].name, vm.anexos))
						vm.anexos.push(input.files[i]);
				}
				input.value = '';
			});
		}


		vm.lerAnexos = function () {
			var reader = new FileReader();
			reader.onload = function (event) {
				ArrayArquivoEmBytes.push(event.target.result);
			}
			reader.readAsText(file);
		}

		/* Fim anexos */


		/* Enviar declaração */

		vm.enviarDeclaracao = function () {
			if (vm.somaValoresRetencInss >= vm.dadosRetencContribPrev.informacoesDatasPermitidas.limCon) {
				var txt;
				var r = confirm("Confirma a retenção dos valores de INSS no período de " + vm.refIni + " a " + vm.refIni + " via outras fontes pagadoras informada?");
				if (r == true) {
					vm.lerAnexos();
					// Tentativa de envio de declaração.
					// ver se tem falha
					// se tiver falha, verificar codigo.
					// codigo constante.ErroDeclEnv
					// Envia novamente com o parâmetro sobrepor=s na url.
					// Mandar mensagem de sucesso.
					incluirDeclaracao(vm.dadosRetencContribPrev.refIni,
						vm.dadosRetencContribPrev.refFin,
						vm.dadosRetencContribPrev.empresasPagadoras,
						vm.dadosRetencContribPrev.dadosCooperado.numCad);
				} else {
					vm.limparTela();
				}
			} else {
				vm.lerAnexos();
				// Tentativa de envio de declaração.
				// ver se tem falha
				// se tiver falha, verificar codigo.
				// codigo constante.ErroDeclEnv
				// Envia novamente com o parâmetro sobrepor=s na url.
				// Mandar mensagem de sucesso.
				incluirDeclaracao(vm.dadosRetencContribPrev.refIni,
					vm.dadosRetencContribPrev.refFin,
					vm.dadosRetencContribPrev.empresasPagadoras,
					vm.dadosRetencContribPrev.dadosCooperado.numCad);
			}
		}

		vm.incluirDeclaracao = function (refIni, refFin, empresasPagadoras, crm) {
			$http({
				method: "GET",
				url: vm.getUrlAutenticacao()
			}).then(function (response) {
				var acesso = response.data;
				$http({
					method: "POST",
					url: vm.getUrlIncluirDeclaracao(refIni, refFin, empresasPagadoras, crm, acesso)
				}).then(function (response) {
					if (response.data.falha) {
						if (response.data.falha.status === "0") {
							var txt;
							var r = confirm(response.data.falha.erroExecucao);
							if (r == true) {
								$http({
									method: "POST",
									url: vm.getUrlIncluirDeclaracao(refIni, refFin, empresasPagadoras, crm, acesso, true),
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

		vm.tratarInicioReferencia = function () {

			//Se o campo estiver vazio não há nada a ser validado
			if (vm.refIni.length == 0) return;

			var refIniArr = vm.refIni.split('/');

			//Verifica se o mês do período é válido
			if (refIniArr[0] < 1 || refIniArr[0] > 12) {
				alert("O mês do período deve estar entre 1 e 12!");
				vm.refIni = '';
				$('#refIni').focus();
				return;
			}


			var dataAtual = new Date();

			var diaLimite = vm.dadosRetencContribPrev.informacoesDatasPermitidas.diaLim;

			if (!vm.isAnoCorrente(vm.refIni)) {
				alert("Mês inicial de referência deverá ser dentro do ano corrente!");
				vm.refIni = '';
				$('#refIni').focus();
			} else if (vm.isCompetenciaAnterior()) {
				alert("Não é permitido o lançamento de declarações com competência inicial inferior à competência atual!");
				vm.refIni = '';
				$('#refIni').focus();
			} else if (vm.isCompetenciaAtual() && dataAtual.getDate() > diaLimite) {
				alert("Data limite para envio da declaração do mês corrente ultrapassada!");
				vm.refIni = '';
				$('#refIni').focus();
			}

		}


		vm.tratarFimReferencia = function () {

			//Se o campo estiver vazio não há nada a ser validado
			if (vm.refFin.length == 0) return;

			var refFimArr = vm.refFin.split('/');

			//Verifica se o mês do período é válido
			if (refFimArr[0] < 1 || refFimArr[0] > 12) {
				alert("O mês do período deve estar entre 1 e 12!");
				vm.refFin = '';
				$('#refFin').focus();
				return;
			}



			if (!vm.isAnoCorrente(vm.refFin)) {
				alert("Mês final de referência deverá ser dentro do ano corrente!");
				vm.refFin = '';
				$('#refFin').focus();
			}


			if (vm.isRefFinalMaior(vm.refIni, vm.refFin)) {
				alert("Mês final de referência deverá ser anterior ou igual ao mês ano inicial de referência!");
				vm.refFin = '';
				$('#refFin').focus();
			}

		}

		vm.isCompetenciaAtual = function () {

			var splitDtIniRef = vm.refIni.split("/");

			var mes = splitDtIniRef[0];
			var ano = splitDtIniRef[1];

			var dataAtual = new Date();

			if (mes == dataAtual.getMonth() + 1 && ano == dataAtual.getFullYear()) {
				return true;
			} else {
				return false;
			}

		}

		vm.isCompetenciaAnterior = function () {

			var splitDtIniRef = vm.refIni.split("/");

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


		vm.isAnoCorrente = function (valorCampo) {

			var dataAtual = new Date();

			var splitDtIniRef = valorCampo.split("/");

			var ano = splitDtIniRef[1];

			if (ano != dataAtual.getFullYear()) {
				return false;
			}

			return true;

		}

		vm.isRefFinalMaior = function (refIni, refFim) {

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

		vm.getDataFimInc = function () {
			var split = vm.dadosRetencContribPrev.informacoesDatasPermitidas.fimInc.split("/");
			var ano = split[2];
			var mes = split[1];
			var dia = split[0];
			var dataLimite = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
			return dataLimite;
		}

		vm.getDataInicioInc = function () {
			var split = vm.dadosRetencContribPrev.informacoesDatasPermitidas.iniInc.split("/");
			var ano = split[2];
			var mes = split[1];
			var dia = split[0];
			var dataLimite = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
			return dataLimite;
		}

		vm.tratarPermissaoEnvioDeclaracao = function () {
			if (new Date() > vm.getDataFimInc()) { //RN 08
				vm.desabilitaEnvio = true;
				alert("Prazo para envio da declaração encerrado em " + vm.dadosRetencContribPrev.informacoesDatasPermitidas.fimInc);
			}
			else {
				if (new Date() < vm.getDataInicioInc()) { // RN 09
					vm.desabilitaEnvio = true;
					alert("Declaração de Retenção de contribuição previdenciária poderá ser enviada a partir do dia " + vm.dadosRetencContribPrev.informacoesDatasPermitidas.iniInc);
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

		vm.getInicioValidade = function (refIni) {
			return "01/" + refIni;
		}

		vm.getFimValidade = function (refFim) {
			var mesEAno = refFim.split("/");
			var dias = getNumDiasMes(mesEAno[0], mesEAno[1]);
			return dias + "/" + refFim;
		}


		/* Varredura de listas */

		vm.contemEmpresaNaLista = function (cnpj, listaEmpresas) {
			var contem = false;
			for (var i = 0; i < listaEmpresas.length; i++) {
				if (listaEmpresas[i].numIns === cnpj) {
					contem = true;
				}
			}
			return contem;
		}
		
		vm.contemNaLista = function (objeto, objetos) {
			var contem = false;
			for (var i = 0; i < objetos.length; i++) {
				if (objetos[i].name === objeto) {
					contem = true;
				}
			}
			return contem;
		}
		/* Fim Varredura de listas */

		vm.getDadosCooperado(7007);

		vm.limparTela();

		/* MOCKS */

		vm.param1 = "Se dados acima incorretos, entrar em contato com sua analista de relacionamento para atualização.";
		vm.param2 = "VAI VIR PREENCHIDO {PARAMETRO 2}";


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