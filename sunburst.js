//Inspired by example from Kerry Rodden

var width = 750;
var height = 600;
var radius = 300;

var label = {
  w: 100, h: 30, s: 3, t: 10
};

var colors = {
  "White": "#ec8779",
  "Asian": "#115E4E",
  "Multiracial": "#37392C",
  "Hispanic": "#6C8C77",
  "Black": "#c68c53",
  "Middle Eastern": "#5D6204",
  "Straight": "#f6d988",
  "N/A": "#593F0C",
  "Bisexual": "#E78524",
  "Gay": "#64675E",
  "Lesbian": "#8C7541",
  "Winner": "#932200",
  "Nominee": "#5A9486"
};

var totalSize = 0; 

var vis = d3.select("#graph").append("svg:svg")
    .attr("height", height)
    .attr("width", width)
    .append("svg:g")
    .attr("id", "container")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var partition = d3.layout.partition()
    .size([2 * Math.PI, radius * radius])
    .value(function(d) { 
      return d.size; 
    });

var arc = d3.svg.arc()
    .startAngle(function(d) { 
      return d.x; 
    })
    .endAngle(function(d) { 
      return d.x + d.dx; 
    })
    .innerRadius(function(d) { 
      return Math.sqrt(d.y); 
    })
    .outerRadius(function(d) { 
      return Math.sqrt(d.y + d.dy); 
    });

d3.text("DiversityInOscars.csv", function(text) {
  var csv = d3.csv.parseRows(text);
  var json = hierarchy(csv);

  createSunburst(json);

});

function createSunburst(json) {
  breadcrumb();
  drawLegend();

  vis.append("svg:circle")
      .attr("r", radius)
      .style("opacity", 0);

  var nodes = partition.nodes(json)
      .filter(function(d) {
      return (d.dx > 0.005); 
      });

  var path = vis.data([json]).selectAll("path")
      .data(nodes)
      .enter().append("svg:path")

      .attr("display", function(d) { 
        return d.depth ? null : "none"; 
      })
      .attr("d", arc)
      .attr("fill-rule", "evenodd")

      .style("fill", function(d) { 
        return colors[d.name]; 
      })

      .style("opacity", 1)
      .on("mouseover", hover);

  d3.select("#container").on("mouseleave", unhover);
  totalSize = path.node().__data__.value;
 };

function hover(d) {
  var percent = (100 * d.value / totalSize).toPrecision(3);
  var percentString = percent + "%";
  
  if (percent < 0.1) {
    percentString = "< 0.1%";
  }

  d3.select("#percent")
      .text(percentString);

  d3.select("#text")
      .style("visibility", "");

  var pathwayArray = getParent(d);
  updateBreadcrumbs(pathwayArray, percentString);

  d3.selectAll("path")
      .style("opacity", 0.3);

  vis.selectAll("path")
      .filter(function(node) {
                return (pathwayArray.indexOf(node) >= 0);
              })
      .style("opacity", 1);
}

function unhover(d) {
  d3.select("#trail")
      .style("visibility", "hidden");

  d3.selectAll("path").on("mouseover", null);

  d3.selectAll("path")
      .transition()
      .duration(1000)
      .style("opacity", 1)
      .each("end", function() {
              d3.select(this).on("mouseover", hover);
            });

  d3.select("#text")
      .style("visibility", "hidden");
}

function getParent(node) {
  var path = [];
  var current = node;
  while (current.parent) {
    path.unshift(current);
    current = current.parent;
  }
  return path;
}

function breadcrumb() {
  var trail = d3.select("#pathway").append("svg:svg")
      .attr("width", width)
      .attr("height", 50)
      .attr("id", "trail");
  trail.append("svg:text")
    .attr("id", "endlabel")
    .style("fill", "#000");
}

function breadcrumbPoints(d, i) {
  var points = [];
  points.push("0,0");
  points.push(label.w + ",0");
  points.push(label.w + label.t + "," + (label.h / 2));
  points.push(label.w + "," + label.h);
  points.push("0," + label.h);
 
  if (i > 0) { 
    points.push(label.t + "," + (label.h / 2));
  }

  return points.join(" ");
}

function updateBreadcrumbs(nodeArray, percentString) {
  var g = d3.select("#trail")
      .selectAll("g")
      .data(nodeArray, function(d) { 
        return d.name + d.depth; 
      });
  var entering = g.enter().append("svg:g");
 
  console.log(nodeArray);
 
  entering.append("svg:polygon")
      .attr("points", breadcrumbPoints)

      .style("fill", function(d) { 
        return colors[d.name]; 
      });

  entering.append("svg:text")
      .attr("x", (label.w + label.t) / 2)
      .attr("y", label.h / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")

      .text(function(d) { 
        return d.name; 
      });

  g.attr("transform", function(d, i) {
    return "translate(" + i * (label.w + label.s) + ", 0)";
  });

  g.exit().remove();

  d3.select("#trail").select("#endlabel")
      .attr("x", (nodeArray.length + 0.5) * (label.w + label.s))
      .attr("y", label.h / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .text(percentString);

  d3.select("#trail")
      .style("visibility", "");

}

function drawLegend() {
  var le = {
    w: 100, h: 30, s: 3, r: 3
  };

  var legend = d3.select("#legend").append("svg:svg")
      .attr("width", le.w)
      .attr("height", d3.keys(colors).length * (le.h + le.s));

  var g = legend.selectAll("g")
      .data(d3.entries(colors))
      .enter().append("svg:g")
      .attr("transform", function(d, i) {
              return "translate(0," + i * (le.h + le.s) + ")";
           });

  g.append("svg:rect")
      .attr("rx", le.r)
      .attr("ry", le.r)
      .attr("width", le.w)
      .attr("height", le.h)
      .style("fill", function(d) { 
        return d.value; 
      });

  g.append("svg:text")
      .attr("x", le.w / 2)
      .attr("y", le.h / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .text(function(d) { 
        return d.key; 
      });
}


function hierarchy(csv) {
  var root = {"name": "root", "children": []};
  
  for (var i = 0; i < csv.length; i++) {
    var pathway = csv[i][0];
    var size = +csv[i][1];
    
    if (isNaN(size)) { 
      continue;
    }

    var parts = pathway.split("-");
    var currentNode = root;
    
    for (var j = 0; j < parts.length; j++) {
      var children = currentNode["children"];
      var nodeName = parts[j];
      var childNode;
      
      if (j + 1 < parts.length) {
 	      var foundChild = false;
 	        for (var k = 0; k < children.length; k++) {
 	          if (children[k]["name"] == nodeName) {
 	            childNode = children[k];
 	            foundChild = true;
 	            break;
 	          }
 	        }

     	  if (!foundChild) {
     	    childNode = {"name": nodeName, "children": []};
     	    children.push(childNode);
     	  }
 	      currentNode = childNode;
      } else {
       	childNode = {"name": nodeName, "size": size};
       	children.push(childNode);
      }
    }
  }
  return root;
};
