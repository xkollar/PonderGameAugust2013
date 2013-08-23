/********************************************\
 *
 *  PonderGameAugust2013 - Browser-based game to help solve
 *    August 2013 challenge of Ponder This. (It won't solve
 *    it for you, it will merely turn one significant part
 *    of it into what I perceive as sufficiently nice game.
 *
 *  Copyright (C) 2013 Matej Kollar
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, version 3 of the License.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
\********************************************/

(function() {
"use strict"

var conf =
  { side: 20
  , radius: 6
  , dimensions: 9
  , howFar: 2
  , shiftx: [1, 0.5, 0, 3, 0, 7, 0, 15, 0]
  , shifty: [0, 0.5, 1, 0, 3, 0, 7, 0, 15]
  , offsetX: 25
  , offsetY: 25
  , defaultColor: '#000000'
  , cursorColor: 'violet'
  , pallete:
    [ '#CC8888', '#88CC88', '#8888CC', '#CCCC88'
    , '#CC88CC', '#88CC88', '#A88888', '#88A888'
    , '#8888A8', '#A8A888', '#A88888', '#88A8A8'
    , '#A8CCCC', '#CCA8CC', '#CCCCA8', '#A8A8CC'
    ]
  }

var gWidth = 2 * 13 * conf.side + 2 * conf.offsetX
var gHeight = 2 * 13 * conf.side + 2 * conf.offsetY

var matrixSvg = null
var vertices = null
var remains = 1 << conf.dimensions
var output = "";

var globarRoot = 0

var distance = function(m, n) {
  var i = m ^ n
  i = i - ((i >> 1) & 0x55555555)
  i = (i & 0x33333333) + ((i >> 2) & 0x33333333);
  return (((i + (i >> 4)) & 0x0F0F0F0F) * 0x01010101) >> 24
}

var showBin = function(n) {
  var r = ''
  for (var i = 0; i < conf.dimensions; i++) {
    r = ((n & (1 << i)) ? '1' : '0') + r
  }
  return r
}

var getPos = function(n, arr) {
  var r = 0
  var j = 1
  for (var i = 0; i < conf.dimensions; i++) {
    r += (j & n) ? arr[i] : 0
    j = j << 1
  }
  return r * conf.side
}

var getX = function(n) {
  return getPos(n, conf.shiftx) + conf.offsetX
}

var getY = function(n) {
  return gHeight - (getPos(n, conf.shifty) + conf.offsetY)
}

var setText = function() {
  $('#textField').text('Root: ' + globarRoot + '\nRemains: ' + remains + '\nColored: ' + ((1 << conf.dimensions ) - remains) + '\nUsed: [' + output + ']')
}

var vHoverIn = function() {
  $(this).animate({svgFill: conf.cursorColor}, 200)
  $('#textField').text('Vertex: ' + this.n + ' (' + this.bn + ' bin)')
}

var vHoverOut = function() {
  $(this).animate({svgFill: vertices[this.n].color}, 200)
  setText()
}

var vClick = function() {
  var root = this.n
  globarRoot = root
  for (var i = 0; i < (1 << conf.dimensions); i++) {
    setPos(i, root)
  }
}

var cClick = function() {
  if (vertices[globarRoot].used) {
    alert("That would be highly inefficient...")
    return
  }
  vertices[globarRoot].used = true
  for (var i = 0; i < (1 << conf.dimensions); i++) {
    if (distance(globarRoot,i) <= conf.howFar) {
        setColor(i, conf.pallete[this.n])
    }
  }
  $(this).animate({svgStroke: 'black', svgStrokeWidth: 1 }, 200)
  $(vertices[globarRoot].gr).animate({svgStroke: 'black', svgStrokeWidth: 1 }, 200)
  $(this).unbind("click")
  output += ((output == "") ? "" : ", ") + globarRoot
  setText()
}

var setPos = function(n, root) {
  var v = vertices[n]
  var p = v.value ^ root
  $(v.gr).animate({svgCx: getX(p), svgCy: getY(p)}, 2000)
}

var setColor = function(n, color) {
  var v = vertices[n]
  v.color = color
  if (! v.colored) {
    remains -= 1
    if (remains == 0) {
      alert("Congrats!")
    }
  }
  v.colored = true
  $(v.gr).animate({svgFill: color}, 200)
}

function Vertex(value, color) {
  vertices[value] = this
  this.value = value
  this.color = color
  this.coloed = false
  this.used = false
  var pos = Math.floor(Math.random() * (1 << conf.dimensions))
  // var pos = 0
  this.gr = matrixSvg.circle(getX(pos), getY(pos), conf.radius, {fill: this.color})
  this.gr.n = value
  this.gr.bn = showBin(value)
}

var gInit = function(w,h,f,c) {
  $('#PlayMatrix').height(gHeight)
  $('#PlayMatrix').width(gWidth)
  $('#PlayMatrix').svg()
  matrixSvg = $('#PlayMatrix').svg('get')
  vertices = []
  var v = null
  for (var i = 0; i < (1 << conf.dimensions); i++) {
    v = new Vertex(i, conf.defaultColor)
    setPos(i, globarRoot)
    $(v.gr).click(vClick)
    $(v.gr).hover(vHoverIn, vHoverOut)
  }
  var c = null
  var r = gHeight/conf.pallete.length
  for (var i = 0; i < conf.pallete.length; i++) {
    c = matrixSvg.rect(0, Math.floor(i*r), conf.offsetX - (conf.radius * 1.5), Math.floor((i+1)*r)-Math.floor(i*r) - 1, {fill: conf.pallete[i]})
    c.n = i
    $(c).click(cClick)
  }
  $('#textField').text('Hello! You see one possible representation of ' + conf.dimensions + ' dimensional cube. Click on vertex will move it ot lower left corner. Click on color will color all vertices reachable from current root in no more than ' + conf.howFar + ' steps. Your task is to color all vertices. Good luck!')
}

$(document).ready(function() {
  gInit()
})

})()
