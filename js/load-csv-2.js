/*
	FREELY TAKEN FROM eesur at http://bl.ocks.org/eesur/1a2514440351ec22f176
	ALL CREDITS GO TO THE AUTHOR
*/

var red_to_blue = d3.scale.linear()
  .domain([0, 100])
  .range(["#CC0000", "#003366"])
  .interpolate(d3.interpolateLab);

var color = function(d) { return red_to_blue(d['Religious rate (%)']); };

/*
	FREELY TAKEN FROM http://charts.graphicbaseball.com/parallelpitching
	ALL CREDITS GO TO THE AUTHOR
*/

// Here csv file is loaded
d3.csv('data/data_table_justifiability_2.csv', function(data) {
  // slickgrid needs each data element to have an id
  data.forEach(function(d,i) { d.id = d.id || i; });

  var parcoords = d3.parcoords()("#example")
	.color(color)
	.data(data)
	.alpha(0.4)
	.mode("queue") // progressive rendering
	.height(d3.max([document.body.clientHeight-297, 200]))
	.margin({
	  top: 36,
	  left: 0,
	  right: 0,
	  bottom: 40
	})
	.render()
	.reorderable()
	.brushable();

  // setting up grid
  var column_keys = d3.keys(data[0]);
  var columns = column_keys.map(function(key,i) {
	return {
	  id: key,
	  name: key,
	  field: key,
	  sortable: true
	}
  });

  var options = {
	enableCellNavigation: true,
	enableColumnReorder: false,
	multiColumnSort: false,
	forceFitColumns: false
  };

  var dataView = new Slick.Data.DataView();
  var grid = new Slick.Grid("#grid", dataView, columns, options);

  // wire up model events to drive the grid
  dataView.onRowCountChanged.subscribe(function (e, args) {
	grid.updateRowCount();
	grid.render();
  });

  dataView.onRowsChanged.subscribe(function (e, args) {
	grid.invalidateRows(args.rows);
	grid.render();
  });

  // column sorting
  var sortcol = column_keys[0];
  var sortdir = 1;

  function comparer(a, b) {
	var x = a[sortcol], y = b[sortcol];
	return (x == y ? 0 : (x > y ? 1 : -1));
  }
  
  // click header to sort grid column
  grid.onSort.subscribe(function (e, args) {
	sortdir = args.sortAsc ? 1 : -1;
	sortcol = args.sortCol.field;

	if ($.browser.msie && $.browser.version <= 8) {
	  dataView.fastSort(sortcol, args.sortAsc);
	} else {
	  dataView.sort(comparer, args.sortAsc);
	}
  });

  // highlight row in chart
  grid.onMouseEnter.subscribe(function(e,args) {
	var i = grid.getCellFromEvent(e).row;
	var d = parcoords.brushed() || data;
	parcoords.highlight([d[i]]);
  });
  grid.onMouseLeave.subscribe(function(e,args) {
	parcoords.unhighlight();
  });

  // fill grid with data
  gridUpdate(data);

  // update grid on brush
  parcoords.on("brush", function(d) {
	gridUpdate(d);
  });

  function gridUpdate(data) {
	dataView.beginUpdate();
	dataView.setItems(data);
	dataView.endUpdate();
  };
});