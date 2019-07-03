sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/viz/ui5/format/ChartFormatter",
	"sap/viz/ui5/api/env/Format"
], function (Controller, ChartFormatter, Format) {
	"use strict";

	return Controller.extend("com.web.ValueStreamAndon.controller.Main", {

		onInit: function () {
			Format.numericFormatter(ChartFormatter.getInstance());
			var formatPattern = ChartFormatter.DefaultPattern;

			var oVizFrame = this.getView().byId("rotorStatorVizFrame");

			oVizFrame.setVizProperties({
				width: "100%",
				height: "100%",

				plotArea: {
					dataLabel: {
						formatString: formatPattern.SHORTFLOAT_MFD2,
						visible: true,
						showTotal: false
					}
				},
				valueAxis: {
					label: {
						formatString: formatPattern.SHORTFLOAT
					},
					title: {
						visible: true,
						text: "Total"
					}
				},
				valueAxis2: {
					label: {
						formatString: formatPattern.SHORTFLOAT
					},
					title: {
						visible: true
					}
				},
				categoryAxis: {
					title: {
						visible: false
					}
				},
				title: {
					visible: true,
					text: "Matched Rotors and Stators"
				}
			});

			var oVizFrame2 = this.oVizFrame = this.getView().byId("onTimeDeliveryVizFrame");

			oVizFrame2.setVizProperties({
				plotArea: {
					dataLabel: {
						formatString: formatPattern.SHORTFLOAT_MFD2,
						visible: true,
						showTotal: false
					}
				},

				valueAxis: {
					label: {
						formatString: formatPattern.SHORTFLOAT
					},
					title: {
						visible: true,
						text: 'Units'
					}
				},
				valueAxis2: {
					label: {
						formatString: formatPattern.SHORTFLOAT
					},
					title: {
						visible: false
					}
				},
				categoryAxis: {
					title: {
						visible: false
					}
				},
				title: {
					visible: true,
					text: 'On Time Delivery'
				}
			});

			var stackedColColours = [{
				'feed': 'color',
				'palette': ['#505BFA', '#CD4141', '#FF9F4F', '#FFE75F', '#A6E786']
			}];
			var stackedColColoursEnable = {
				replace: true
			};
			oVizFrame2.setVizScales(stackedColColours, stackedColColoursEnable);

			var oVizFrame3 = this.oVizFrame = this.getView().byId("outputVizFrame");

			oVizFrame3.setVizProperties({
				plotArea: {
					dataLabel: {
						formatString: formatPattern.SHORTFLOAT_MFD2,
						visible: false,
						showTotal: true,
						colorPalette: ["#FFA34D", "#B1EFEF", "#A068CC"]
					}
				},
				valueAxis: {
					label: {
						formatString: formatPattern.SHORTFLOAT
					},
					title: {
						visible: true,
						text: "Total"
					}
				},
				valueAxis2: {
					label: {
						formatString: formatPattern.SHORTFLOAT
					},
					title: {
						visible: false
					}
				},
				categoryAxis: {
					title: {
						visible: false
					}
				},
				title: {
					visible: true,
					text: "Daily Output Rate"
				}
			});

			var lineGraphColours = [{
				'feed': 'color',
				'palette': ["#FFA34D", "#82CFC6", "#A068CC"]
			}];
			var lineGraphColoursEnable = {
				replace: true
			};
			oVizFrame3.setVizScales(lineGraphColours, lineGraphColoursEnable);

		},

		onAfterRendering: function () {
			var outer = this,
				oModel1 = outer.getView().getModel("stackedBarData"),
				oModel2 = outer.getView().getModel("stackedColumnData"),
				oModel3 = outer.getView().getModel("lineGraphData");

			setInterval(function () {

				var randoms = new Date().getTime();
				oModel1.loadData(outer.getOwnerComponent().getManifestEntry("sap.app").dataSources.stackedBarData.uri + "?" + randoms, true);
				oModel2.loadData(outer.getOwnerComponent().getManifestEntry("sap.app").dataSources.stackedColumnData.uri + "?" + randoms, true);
				oModel3.loadData(outer.getOwnerComponent().getManifestEntry("sap.app").dataSources.lineGraphData.uri + "?" + randoms, true);

				var day = new Date().toString().substring(0, 3);
				var weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
				var date = new Date().getMinutes() - (new Date().getMinutes() % 30);
				var data;
				var diff;

				if (date === 0) {
					date = new Date().getHours() - 1 + ":" + "30:00";
				} else {
					date = new Date().getHours() + ":" + (new Date().getMinutes() - (new Date().getMinutes() % 30)) + ":00";
				}

				if (day === "Mon") {
					day = "Monday";
				} else if (day === "Tue") {
					day = "Tuesday";
				} else if (day === "Wed") {
					day = "Wednesday";
				} else if (day === "Thu") {
					day = "Thursday";
				} else if (day === "Fri") {
					day = "Friday";
				}

				weekdays.forEach(function (days) {
					data = oModel3.getData().Rowsets.Rowset[0].Row.filter(function (elem) {
						if (elem.DAY === day && elem.LOOP_TIME === date) {
							return elem;
						}
					});
				});

				outer.byId("runningTarget").setText(Math.round(data[0].RUNNING_TARGET));
				outer.byId("actualOutput").setText(data[0].FINISHED_DAY_PACK);
				diff = Math.round(data[0].FINISHED_DAY_PACK - data[0].RUNNING_TARGET);
				outer.byId("difference").setText(diff);

				if (diff < 0) {
					outer.byId("difference").addStyleClass("negatives");
				} else {
					outer.byId("difference").addStyleClass("positives");
				}
				outer.formatChart();
			}, 5000);
			
			var start1 = new Date().getTime();
				for (var i = 0; i < 1e7; i++) {
					if ((new Date().getTime() - start1) > 3000) {
						break;
					}
				}

			$("#container-ValueStreamAndon---Main--shell").removeClass('sapMShellAppWidthLimited');

			if ($("#loading").hide()) {
				var start2 = new Date().getTime();
				for (var j = 0; j < 1e7; j++) {
					if ((new Date().getTime() - start2) > 3000) {
						break;
					}
				}
			}
		},
		formatChart: function () {
			this.byId("rotorStatorVizFrame").setVizProperties({
				legend: {
					visible: false
				},
				plotArea: {
					dataPointStyle: {
						"rules": [{
							"dataContext": {
								"stackName": "Matched Rotors & Stators"
							},
							"properties": {
								"color": "#78D07C"
							},
						}, {
							"dataContext": {
								"stackName": "Un-Matched Rotors"
							},
							"properties": {
								"color": "#FF9F4F"
							},
						}],
						"others": {
							"properties": {
								"color": "#CD4141"
							},
						}
					}
				}
			});
		}
	});
});