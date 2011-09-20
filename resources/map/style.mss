Map {
  background-color: #fff;
}

#water {
  ::outline {
    line-color: #85c5d3;
    line-width: 2;
    line-join: round;
  }
  polygon-fill: #b8dee6;
}

#boundry {
  polygon-fill: #eaeaea;
  line-color: #ff0;
  line-width: 3;
  line-join: round;
}

#hoods {
    [pop90 > 2000][pop90 < 4000] {
      polygon-fill: #ccc;
    }
    [pop90 >= 4000][pop90 < 6000] {
      polygon-fill: #666;
    }
    [pop90 >= 6000] {
      polygon-fill: #333;
    }
}
