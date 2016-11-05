var Lebensrisikoexplorer = function() {

	this.initMap();

	this.initTimeline();
};
Lebensrisikoexplorer.prototype.initMap = function() {
	var me = this;
	var layers = [];

	this.addBingMapsArielLabelLayer(layers)

	this.addRegionLayer(layers);

	this.addWaypointLayer(layers);

	this.map = new ol.Map({
		layers : layers,
		// Improve user experience by loading tiles while dragging/zooming. Will
		// make
		// zooming choppy on mobile or slow devices.
		loadTilesWhileInteracting : true,
		target : 'map',
		view : new ol.View({
			// projection: projection,
			// center : ol.proj.transform([ -6655.5402445057125,
			// 6709968.258934638 ], 'EPSG:4326', 'EPSG:3857'),
			center : [ 1005087.7847209086, 6608235.561256706 ],
			zoom : 6
		})
	});

	// Patch openlayers to get an event after mass feature add

	var oldAddFeatures = ol.source.Vector.prototype.addFeatures;

	ol.source.Vector.prototype.addFeatures = function() {
		var value = oldAddFeatures.apply(this, arguments);
		this.dispatchEvent("addfeatures");
		return value;
	};

	var zoomToExtend = function(e) {
		me.map.getView().fit(me.wfsVectorSource.getExtent(), me.map.getSize());
	};

	this.wfsVectorSource.on("addfeatures", zoomToExtend);

};
Lebensrisikoexplorer.prototype.addBingMapsArielLabelLayer = function(layers) {
	layers
			.push(new ol.layer.Tile(
					{
						visible : true,
						preload : Infinity,
						source : new ol.source.BingMaps(
								{
									key : 'AuDCKFGW8HwneyywNoGyWAvPnGATOgPQlGh6QwyYZyaJM28UKIzakjWvEaNkg03v',
									imagerySet : "AerialWithLabels"
								// use maxZoom 19 to see stretched tiles instead
								// of the BingMaps
								// "no photos at this zoom level" tiles
								// maxZoom: 19
								})
					}));
};
Lebensrisikoexplorer.prototype.addRegionLayer = function(layers) {
	var me = this;
	this.wfsRegionVectorSource = new ol.source.Vector(
			{
				format : new ol.format.GeoJSON(),
				url : function(extent) {
					return 'http://localhost:8080/geoserver/lebensrisikoexplorer/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=lebensrisikoexplorer:region&maxFeatures=70000&outputFormat=application%2Fjson&srsname=EPSG:3857&'
							+ 'bbox=' + extent.join(',') + ',EPSG:3857';
				},
				strategy : ol.loadingstrategy.bbox
			});

	this.wfsRegionVectorLayer = new ol.layer.Vector({
		visible : false,
		source : this.wfsRegionVectorSource,
		style : new ol.style.Style({
			stroke : new ol.style.Stroke({
				color : '#bada55',
				width : 1
			})
		})
	});
	layers.push(this.wfsRegionVectorLayer);
};
Lebensrisikoexplorer.prototype.addWaypointLayer = function(layers) {
	var me = this;
	this.CQL_FILTER = "";
	this.wfsVectorSourceUrl = 'http://localhost:8080/geoserver/lebensrisikoexplorer/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=lebensrisikoexplorer:waypoint&maxFeatures=10000&outputFormat=application%2Fjson&srsname=EPSG:3857&';
	this.wfsVectorSource = new ol.source.Vector({
		format : new ol.format.GeoJSON(),
		url : function(extent) {
			return me.wfsVectorSourceUrl
					+ (me.CQL_FILTER ? me.CQL_FILTER : 'bbox='
							+ extent.join(',') + ',EPSG:3857');
		},
		strategy : ol.loadingstrategy.bbox
	});

	this.wfsVectorLayer = new ol.layer.Vector({
		visible : true,
		source : this.wfsVectorSource,
		style : new ol.style.Style({
			image : new ol.style.Circle({
				radius : 5,
				fill : new ol.style.Fill({
					color : '#f33'
				}),
				stroke : new ol.style.Stroke({
					color : '#bada55',
					width : 1
				})
			})
		})
	});
	layers.push(this.wfsVectorLayer);
};
Lebensrisikoexplorer.prototype.initTimeline = function() {
	var me = this;

	var color = d3.scale.linear().interpolate(d3.interpolateHcl).domain(
			[ 0, 9 ]).range([ "rgb(249,239,149)", "rgb(160,41,36)" ]);

	d3
			.json(
					"rest/waypoints",
					function(error, waypoints) {

						waypoints = waypoints.map(function(e) {
							return {
								"date" : new Date(e[1]),
								"value" : e[0],
								"risk" : e[2]
							}

						});

						function barChart() {
							if (!barChart.id)
								barChart.id = 0;

							var margin = {
								top : 10,
								right : 10,
								bottom : 20,
								left : 10
							}, x, y = d3.scale.linear().range([ 100, 0 ]), id = barChart.id++, axis = d3.svg
									.axis().orient("bottom"), brush = d3.svg
									.brush(), brushDirty, dimension, group, round, riskQuantil;

							function chart(div) {
								var width = x.range()[1], height = y.range()[0];

								y.domain([ 0, group.top(1)[0].value ]);

								div
										.each(function() {
											var div = d3.select(this), g = div
													.select("g");

											// Create the skeletal chart.
											if (g.empty()) {

												g = div
														.append("svg")
														.attr(
																"width",
																width
																		+ margin.left
																		+ margin.right)
														.attr(
																"height",
																height
																		+ margin.top
																		+ margin.bottom)
														.append("g")
														.attr(
																"transform",
																"translate("
																		+ margin.left
																		+ ","
																		+ margin.top
																		+ ")");
												
												var bar = g.selectAll(".bar")
												    .data(group.all())
												    .enter()
												    	.append("g")
												        .attr("transform", function(d, i) {
												        	var normalizeHeight = y(d.value);
												        	return "translate(" + x(d.key) + ", "+normalizeHeight+")";
												        });
	
												bar.append("rect")
												    .attr("width", function (d, i) { return i != 0 ? x(d.key)/i : x(d.key); } )
												    .attr("height",  function (d,i) {
												    	return height-y(d.value);
												    }).attr("fill", function (d,i) {
												    	return color(riskQuantil[i]);
												    });

												g.append("clipPath").attr("id",
														"clip-" + id).append(
														"rect").attr("width",
														width).attr("height",
														height);

												//g
												//		.selectAll(".bar")
												//		.data(
												//				[ "background",
												//						"foreground" ])
												//		.enter()
												//		.append("path")
												//		.attr(
												//				"class",
												//				function(d) {
												//					return d
												//							+ " bar";
												//				}).datum(
												//				group.all());

												//g.selectAll(".foreground.bar")
												//		.attr(
												//				"clip-path",
												//				"url(#clip-"
												//						+ id
												//						+ ")");

												g.append("g").attr("class",
														"axis").attr(
														"transform",
														"translate(0," + height
																+ ")").call(
														axis);

												// Initialize the brush
												// component with pretty resize
												// handles.
												var gBrush = g.append("g")
														.attr("class", "brush")
														.call(brush);
												gBrush.selectAll("rect").attr(
														"height", height);
												gBrush.selectAll(".resize")
														.append("path")
														.attr("d", resizePath);
											}

											// Only redraw the brush if set
											// externally.
											if (brushDirty) {
												brushDirty = false;
												g.selectAll(".brush").call(
														brush);
												if (brush.empty()) {
													g.selectAll(
															"#clip-" + id
																	+ " rect")
															.attr("x", 0).attr(
																	"width",
																	width);
												} else {
													var extent = brush.extent();
													g
															.selectAll(
																	"#clip-"
																			+ id
																			+ " rect")
															.attr(
																	"x",
																	x(extent[0]))
															.attr(
																	"width",
																	x(extent[1])
																			- x(extent[0]));
												}
											}
											
											//g.selectAll(".bar").attr("d",
											//		barPath);
											
											
										});

								//function barPath(groups) {
								//	var path = [], i = -1, n = groups.length, d;
								//	while (++i < n) {
								//		d = groups[i];
								//		path.push("M", x(d.key), ",", height,
								//				"V", y(d.value), "h9V", height);
								//	}
								//	return path.join("");
								//}

								function resizePath(d) {
									var e = +(d == "e"), x = e ? 1 : -1, y = height / 3;
									return "M" + (.5 * x) + "," + y
											+ "A6,6 0 0 " + e + " " + (6.5 * x)
											+ "," + (y + 6) + "V" + (2 * y - 6)
											+ "A6,6 0 0 " + e + " " + (.5 * x)
											+ "," + (2 * y) + "Z" + "M"
											+ (2.5 * x) + "," + (y + 8) + "V"
											+ (2 * y - 8) + "M" + (4.5 * x)
											+ "," + (y + 8) + "V" + (2 * y - 8);
								}
							}

							brush
									.on(
											"brush.chart",
											function() {
												var g = d3
														.select(this.parentNode), extent = brush
														.extent();
												if (round)
													g
															.select(".brush")
															.call(
																	brush
																			.extent(extent = extent
																					.map(round)))
															.selectAll(
																	".resize")
															.style("display",
																	null);
												g
														.select(
																"#clip-"
																		+ id
																		+ " rect")
														.attr("x", x(extent[0]))
														.attr(
																"width",
																x(extent[1])
																		- x(extent[0]));
												dimension.filterRange(extent);
												me.filterWaypoints(extent[0],
														extent[1]);
											});

							brush
									.on(
											"brushend.chart",
											function() {
												if (brush.empty()) {
													var div = d3
															.select(this.parentNode.parentNode.parentNode);
													div.select(
															"#clip-" + id
																	+ " rect")
															.attr("x", null)
															.attr("width",
																	"100%");
													dimension.filterAll();
												}
											});

							chart.margin = function(_) {
								if (!arguments.length)
									return margin;
								margin = _;
								return chart;
							};

							chart.x = function(_) {
								if (!arguments.length)
									return x;
								x = _;
								axis.scale(x);
								brush.x(x);
								return chart;
							};

							chart.y = function(_) {
								if (!arguments.length)
									return y;
								y = _;
								return chart;
							};

							chart.dimension = function(_) {
								if (!arguments.length)
									return dimension;
								dimension = _;
								return chart;
							};

							chart.filter = function(_) {
								if (_) {
									brush.extent(_);
									dimension.filterRange(_);
								} else {
									brush.clear();
									dimension.filterAll();
								}
								brushDirty = true;
								return chart;
							};

							chart.group = function(_) {
								if (!arguments.length)
									return group;
								group = _;
								return chart;
							};
							
							chart.riskQuantil = function(_) {
								if (!arguments.length)
									return riskQuantil;
								riskQuantil = _;
								return chart;
							};

							chart.round = function(_) {
								if (!arguments.length)
									return round;
								round = _;
								return chart;
							};

							return d3.rebind(chart, brush, "on");
						}

						// Create the crossfilter for the relevant dimensions
						// and
						// groups.
						var waypoint = crossfilter(waypoints), all = waypoint
								.groupAll(), date = waypoint
								.dimension(function(d) {
									return d.date;
								}), risk = date.group(d3.time.day).reduceSum(
								function(d) {
									return d.risk;
								}), dates = date.group(d3.time.day).reduceSum(
								function(d) {
									return d.value;
								});

						var allRisks = risk.all().map(function (d) {
							return d.value;
						});
						
						var xAllRisks = d3.scale.linear()
						    .domain([d3.min(allRisks), d3.max(allRisks)]);
	
						var ticks = xAllRisks.ticks(10);
						
						// Generate a histogram using ten uniformly-spaced bins.
						// in riskQuantil the bin for the risk will be saved
						var riskQuantil = allRisks.map(function (risk) {
							return ticks.reduce(function (sum, value) {
								if(risk > value) {
									return sum+1;
								} else {
									return sum;
								}
							}, 0);
						});
						
						var charts = [ barChart()
								.dimension(date)
								.group(dates)
								.round(d3.time.day.round)
								.riskQuantil(riskQuantil)
								.x(
										d3.time
												.scale()
												.domain(
														[
																new Date(2015,
																		0, 1),
																new Date(2015,
																		11, 31) ])
												.rangeRound(
														[
																0,
																window.innerWidth - 20 ]))
								.filter(
										[ new Date(2015, 0, 1),
												new Date(2015, 0, 7) ]) ];

						// Given our array of charts, which we assume are in the
						// same
						// order as the
						// .chart elements in the DOM, bind the charts to the
						// DOM and
						// render them.
						// We also listen to the chart's brush events to update
						// the
						// display.
						var chart = d3.selectAll(".chart").data(charts).each(
								function(chart) {
									chart.on("brush", renderAll).on("brushend",
											renderAll);
								});
						function renderAll() {
							chart.each(function(method) {
								d3.select(this).call(method);
							});
						}
						renderAll();

					});
};
Lebensrisikoexplorer.prototype.filterWaypoints = function(start, end) {
	// date DURING 2015-10-01T00:30:00Z / 2015-10-31T00:30:00Z
	this.CQL_FILTER = "&CQL_FILTER="
			+ encodeURIComponent("date DURING " + start.toISOString() + " / "
					+ end.toISOString());
	this.wfsVectorSource.clear(true);
};
window.Lebensrisikoexplorer = new Lebensrisikoexplorer();