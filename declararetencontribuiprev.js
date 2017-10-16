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
				"CONNECTION=" + acesso; 
		}

		$scope.getUrlIncluirDeclaracao = function (refIni, refFin, empresasPagadoras, crm, acesso, anexos, sobrepor) {

			var urlIncluirDeclaracao = "https://areadocolaboradordesv.unimedbh.com.br/portalrh/conector?" +
				"ACAO=EXECUTAREGRA&" +
				"SIS=FP&" +
				"REGRA=456&" +
				"metodo=incluirDeclaracao&" +
				"qtdDeclaracao=" + empresasPagadoras.length +
				"&numCad=" + crm + "&";
			for (var i = 0; i < empresasPagadoras.length; i++) {
				urlIncluirDeclaracao += "dadosDeclaracao_" + (i + 1) + "=";
				urlIncluirDeclaracao += (refIni +
					refFin +
					empresasPagadoras[i].numIns +
					empresasPagadoras[i].valSalarContrib +
					empresasPagadoras[i].valRetencInss) + "&";
			}
			urlIncluirDeclaracao += "USER=webservice_INSSCoop&CONNECTION=" + acesso;
			urlIncluirDeclaracao+= "qtdAnexo=" +anexos.length;
			for(var i = 0; i < anexos.length; i++){
				urlIncluirDeclaracao+= "&anexo_"+(i+1)+"="+anexos[i];
			}
			return sobrepor ? urlIncluirDeclaracao + "&sobrepor=S" : urlIncluirDeclaracao + "&sobrepor=N";
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
						montaModal("Erro",response.data.falha.erroExecucao);
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
				numIns: "",
				razSoc: "",
				valSalarContrib: 0.0,
				valRetencInss: 0.0
			}
			$scope.ArrayArquivoEmBytes = [];
			$scope.somaValoresRetencInss = 0.0;
			$scope.somaValoresRetencInssStr = "";
			$scope.filterEmpresa = [];
			$scope.hideEmpresa = true;
			$scope.desabilitarCamposEmpresa = false;
			$scope.desabilitaEnvio = false;
			$scope.carregando = false;

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
				montaModal("Atenção",empresa.razSoc + " já adicionada.");
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
					montaModal("Atenção","Obrigatório informar o CNPJ e Valor do Salário de Contribuição!");
			}
			else {
				//Validar CNPJ.
				if (parseFloat($scope.empresaAIncluir.valRetencInss) > parseFloat($scope.empresaAIncluir.valSalarContrib)) {
					montaModal("Atenção","Valor de retenção do INSS deverá ser inferior ou igual ao valor do salário de contribuição!");
				} else {
					$scope.incluirEmpresa($scope.empresaAIncluir, $scope.empresasPagadoras);
					$scope.desabilitarCamposEmpresa = false;
					$scope.somaValoresRetencInss += parseFloat($scope.empresaAIncluir.valRetencInss.replace(",","."));
					$scope.somaValoresRetencInssStr = $scope.somaValoresRetencInss.toString().replace(".",",");
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
				montaModal("Atenção",empresa.razSoc + " já adicionada.");
			} else {
				lista.push(empresa);
			}
		}

		$scope.removerEmpresa = function (cnpj) {
			for (var i = 0; i < $scope.empresasPagadoras.length; i++) {
				if ($scope.empresasPagadoras[i].numIns === cnpj) {
					$scope.somaValoresRetencInss -= $scope.empresasPagadoras[i].valRetencInss;
					$scope.somaValoresRetencInssStr = $scope.somaValoresRetencInss.toString().replace(".",",");
					$scope.empresasPagadoras.splice(i, 1);

				}
			}
		}

		/* Fim empresas pagadoras */


		/* Anexos */

		$scope.removerAnexo = function (anexo) {

			var nameAnexo = anexo.name;

			for (var i = 0; i < $scope.anexos.length; i++) {
				if ($scope.anexos[i].name === anexo.name) {
					$scope.anexos.splice(i, 1);
				}
			}
		}

		$scope.anexosSelecionados = function (input) {

			$scope.$apply(function ($scope) {
				for (var i = 0; i < input.files.length; i++) {


					if (!$scope.contemNaLista(input.files[i].name, $scope.anexos)) {
                        $scope.anexos.push({
                            name: input.files[i].name
                        });
					}

				}

			});


			$scope.lerAnexos(input.files);


            input.value = '';



		}


		$scope.lerAnexos = function(files) {

            for (var i = 0; i < files.length; i++) {

                var reader = new FileReader();


                reader.onload = (function (theFile) {

                    var fileName = theFile.name;

                    return function (e) {

                        for(var i in $scope.anexos) {
                        	if($scope.anexos[i].name == theFile.name) {
                                $scope.anexos[i].dataURL = e.target.result;
							}
						}

                    };


                })(files[i]);

                reader.readAsBinaryString(files[i]);

            }

		}


		/* Fim anexos */


		/* Enviar declaração */

		$scope.enviarDeclaracao = function () {

			if($scope.empresasPagadoras.length == 0) {
				montaModal('Atenção!', 'É necessário incluir pelo menos 1 empresa pagadora!');
				return false;
			}


			if ($scope.somaValoresRetencInss >= $scope.dadosRetencContribPrev.informacoesDatasPermitidas.limCon) {
				var txt;
				var r = confirm("Confirma a retenção dos valores de INSS no período de " + $scope.refIni + " a " + $scope.refIni + " via outras fontes pagadoras informada?");
				if (r == true) {

					// Tentativa de envio de declaração.
					// ver se tem falha
					// se tiver falha, verificar codigo.
					// codigo constante.ErroDeclEnv
					// Envia novamente com o parâmetro sobrepor=s na url.
					// Mandar mensagem de sucesso.
                    $scope.incluirDeclaracao($scope.dadosRetencContribPrev.refIni,
						$scope.dadosRetencContribPrev.refFin,
						$scope.dadosRetencContribPrev.empresasPagadoras,
						$scope.dadosRetencContribPrev.dadosCooperado.numCad,
						$scope.anexos);
				} else {
					$scope.limparTela();
				}
			} else {

				// Tentativa de envio de declaração.
				// ver se tem falha
				// se tiver falha, verificar codigo.
				// codigo constante.ErroDeclEnv
				// Envia novamente com o parâmetro sobrepor=s na url.
				// Mandar mensagem de sucesso.
				$scope.incluirDeclaracao($scope.refIni,
					$scope.refFin,
					$scope.empresasPagadoras,
					$scope.dadosRetencContribPrev.dadosCooperado.numCad,
					$scope.anexos);
			}
		}

		$scope.incluirDeclaracao = function (refIni, refFin, empresasPagadoras, crm, anexos) {

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
									montaModal("Sucesso","Envio concluído com sucesso!");
                                    $scope.limparTela();
								});
							}
						}
						else {
							montaModal("Erro",response.data.falha.erroExecucao);
						}
					}
					else {
						montaModal("Sucesso","Envio concluído com sucesso!");
                        $scope.limparTela();
					}
				}, function myError(response) {
					console.log(response.statusText);
				});
			}, function myError(response) {
				console.log('aqui');
                console.log(response.statusText);
            });
		}

		/* Fim Enviar declaração */


		/* Tratar período comepetências */

		$scope.tratarInicioReferencia = function () {

			//Se o campo estiver vazio não há nada a ser validado
			if ($scope.refIni.length == 0) return;


			var mes = $scope.refIni.substr(0, 2);

			//Verifica se o mês do período é válido
			if (mes < 1 || mes > 12) {
				montaModal("Atenção!","O mês do período deve estar entre 1 e 12!");
				$scope.refIni = '';
				$('#refIni').focus();
				return;
			}


			var dataAtual = new Date();

			var diaLimite = $scope.dadosRetencContribPrev.informacoesDatasPermitidas.diaLim;

			if (!$scope.isAnoCorrente($scope.refIni)) {
				montaModal("Atenção","Mês inicial de referência deverá ser dentro do ano corrente!");
				$scope.refIni = '';
				$('#refIni').focus();
			} else if ($scope.isCompetenciaAnterior()) {
				montaModal("Atenção","Não é permitido o lançamento de declarações com competência inicial inferior à competência atual!");
				$scope.refIni = '';
				$('#refIni').focus();
			} else if ($scope.isCompetenciaAtual() && dataAtual.getDate() > diaLimite) {
				montaModal("Atenção","Data limite para envio da declaração do mês corrente ultrapassada!");
				$scope.refIni = '';
				$('#refIni').focus();
			}

		}


		$scope.tratarFimReferencia = function () {

			//Se o campo estiver vazio não há nada a ser validado
			if ($scope.refFin.length == 0) return;

			var mes = $scope.refFin.substr(0, 2);

			//Verifica se o mês do período é válido
			if (mes < 1 || mes > 12) {
				montaModal("Atenção","O mês do período deve estar entre 1 e 12!");
				$scope.refFin = '';
				$('#refFin').focus();
				return;
			}


			if (!$scope.isAnoCorrente($scope.refFin)) {
				montaModal("Atenção","Mês final de referência deverá ser dentro do ano corrente!");
				$scope.refFin = '';
				$('#refFin').focus();
			}


			if ($scope.isRefFinalMaior($scope.refIni, $scope.refFin)) {
				montaModal("Atenção","Mês final de referência deverá ser anterior ou igual ao mês ano inicial de referência!");
				$scope.refFin = '';
				$('#refFin').focus();
			}

		}

		$scope.isCompetenciaAtual = function () {

			var mes = $scope.refIni.substr(0, 2);
			var ano = $scope.refIni.substr(2, 4);

			var dataAtual = new Date();

			if (mes == dataAtual.getMonth() + 1 && ano == dataAtual.getFullYear()) {
				return true;
			} else {
				return false;
			}

		}

		$scope.isCompetenciaAnterior = function () {

			var mes = $scope.refIni.substr(0, 2);
			var ano = $scope.refIni.substr(2, 4);

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

			var ano = valorCampo.substr(2, 4);

			if (ano != dataAtual.getFullYear()) {
				return false;
			}

			return true;

		}

		$scope.isRefFinalMaior = function (refIni, refFim) {

			var diaInicio = refIni.substr(0, 2);
			var anoInicio = refIni.substr(2, 4);

			var diaFim = refFim.substr(0, 2);
			var anoFim = refFim.substr(2, 4);

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
				montaModal("Atenção","Prazo para envio da declaração encerrado em " + $scope.dadosRetencContribPrev.informacoesDatasPermitidas.fimInc);
			}
			else {
				if (new Date() < $scope.getDataInicioInc()) { // RN 09
					$scope.desabilitaEnvio = true;
					montaModal("Atenção","Declaração de Retenção de contribuição previdenciária poderá ser enviada a partir do dia " + $scope.dadosRetencContribPrev.informacoesDatasPermitidas.iniInc);
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
})()


function montaModal(titulo, mensagem) {
	alert(mensagem);
}



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