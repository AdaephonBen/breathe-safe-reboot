import React from "react";
import "./App.css";
import { Grommet, Box, Text, Menu } from "grommet";
import { MapLocation } from "grommet-icons";

class App extends React.Component {
  constructor() {
    super();
    this.state = { latitude: -1, longitude: -1, customSelected: false };
  }
  sensorLocations = [
    {
      lat: -33.56939,
      long: -16.29037
    },
    {
      lat: -47.64602,
      long: -82.1686
    },
    {
      lat: -65.50514,
      long: -91.37108
    }
  ];
  haversineDistance(lat1, lon1, lat2, lon2) {
    function toRad(x) {
      return (x * Math.PI) / 180;
    }

    var R = 6371; // km

    var x1 = lat2 - lat1;
    var dLat = toRad(x1);
    var x2 = lon2 - lon1;
    var dLon = toRad(x2);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d * 1000;
  }
  setSensorLocation(sensorIndex) {
    this.setState({
      minimumIndex: sensorIndex,
      minimumDistance: this.haversineDistance(
        this.sensorLocations[sensorIndex].lat,
        this.sensorLocations[sensorIndex].long,
        this.state.latitude,
        this.state.longitude
      ),
      customSelected: true
    });
    if (sensorIndex == 0) {
      this.setState({ nearestSensor: "Hostel Block E" });
    } else if (sensorIndex == 1) {
      this.setState({ nearestSensor: "Academic Block C" });
    }
  }
  findNearestSensor(myLat, myLong) {
    let minimumDistance = this.haversineDistance(
      this.sensorLocations[0].lat,
      this.sensorLocations[0].long,
      myLat,
      myLong
    );
    let minimumIndex = 0;
    let x = 0;
    this.sensorLocations.forEach(location => {
      if (
        this.haversineDistance(location.lat, location.long, myLat, myLong) <
        minimumDistance
      ) {
        minimumIndex = x;
        minimumDistance = this.haversineDistance(
          location.lat,
          location.long,
          myLat,
          myLong
        );
      }
      x++;
    });
    this.setState({
      minimumDistance: minimumDistance,
      minimumIndex: minimumIndex
    });
  }
  findAndUpdateLocation() {
    if (!navigator.geolocation) {
      alert(
        "Sorry, we are unable to process your location. Please manually select the nearest sensor. "
      );
    } else {
      navigator.geolocation.getCurrentPosition(position => {
        this.setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        this.findNearestSensor(
          position.coords.latitude,
          position.coords.longitude
        );

        if (this.state.minimumIndex == 0) {
          this.setState({ nearestSensor: "Hostel Block E" });
        } else if (this.state.minimumIndex == 1) {
          this.setState({ nearestSensor: "Academic Block C" });
        }
      });
    }
  }
  componentDidMount() {
    this.findAndUpdateLocation();
  }
  render() {
    return (
      <Grommet>
        <Box
          tag="header"
          direction="row"
          align="center"
          justify="center"
          background="brand"
          pad="medium"
          elevation="medium"
          style={{ zIndex: "1" }}
        >
          <Text size="xlarge">Welcome to the Canary App</Text>
        </Box>
        <Box justify="center" align="center">
          <Text size="medium" margin={{ left: "medium", top: "medium" }}>
            Your current location is Latitude: {this.state.latitude}, Longitude:{" "}
            {this.state.longitude}.
          </Text>
          <Text size="medium" margin={{ left: "medium", top: "medium" }}>
            {this.state.customSelected ? (
              <div>This sensor is at {this.state.nearestSensor}</div>
            ) : (
              <div>The nearest sensor is at {this.state.nearestSensor}.</div>
            )}
          </Text>
          <Text size="medium"></Text>
          <Box direction="row" margin="medium" align="center">
            <MapLocation size="large" />
            <Menu
              label="Select Location"
              defaultChecked="1"
              margin={{ left: "small" }}
              items={[
                {
                  label: "Hostel Block E",
                  onClick: () => {
                    this.setSensorLocation(0);
                  }
                },
                {
                  label: "Academic Block A",
                  onClick: () => {
                    this.setSensorLocation(1);
                  }
                }
              ]}
            />
          </Box>
          <Box margin={{ top: "medium" }}>
            <iframe
              width="350"
              height="250"
              style={{ border: "0px" }}
              src={
                "https://thingspeak.com/channels/854872/charts/" +
                (this.state.minimumIndex + 1) +
                "?dynamic=true&width=350"
              }
            ></iframe>
          </Box>
        </Box>
      </Grommet>
    );
  }
}

export default App;
