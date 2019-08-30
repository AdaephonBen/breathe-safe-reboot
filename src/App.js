import React from "react";
import "./App.css";
import { Grommet, Box, Text, Menu } from "grommet";
import { MapLocation } from "grommet-icons";

class App extends React.Component {
  constructor() {
    super();
    this.state = { latitude: -1, longitude: -1, customSelected: false };
  }
  decideColor() {
    if (this.state.currentReading <= 1000) {
      return "status-ok";
    } else if (this.state.currentReading <= 2000) {
      return "status-warning";
    } else if (this.state.currentReading > 3000) {
      return "status-critical";
    }
  }
  getSensorReading(index) {
    fetch(
      "https://api.thingspeak.com/channels/854872/fields/" +
        (index + 1) +
        "/last"
    )
      .then(response => response.json())
      .then(response => {
        this.setState({ currentReading: response });
      });
  }
  sensorLocations = [
    {
      lat: 17.5975733,
      long: 78.1270862
    },
    {
      lat: 0,
      long: 0
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
      this.setState({ nearestSensor: "Hostel Block B" });
    } else if (sensorIndex == 2) {
      this.setState({ nearestSensor: "Academic Block A" });
    }
    this.getSensorReading(sensorIndex);
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
    this.getSensorReading(minimumIndex);
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
          this.setState({ nearestSensor: "Hostel Block B" });
        } else {
          this.setState({ nearestSensor: "Academic Block A" });
        }
      });
    }
  }
  componentDidMount() {
    this.findAndUpdateLocation();
  }
  statusOK() {
    return <Text>The air is safe to breathe. </Text>;
  }
  statusMedium() {
    return <Text>The air is slightly polluted. Try to stay indoors. </Text>;
  }
  statusBad() {
    return <Text>The air is very polluted. Definitely stay indoors. </Text>;
  }
  statusShower() {
    if (this.state.currentReading <= 1000) {
      return <Box color="status-ok">{this.statusOK()}</Box>;
    } else if (this.state.currentReading <= 2000) {
    } else {
    }
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
        <Box align="center">
          <Text
            size="medium"
            margin={{ left: "medium", top: "medium", right: "medium" }}
            align="center"
          >
            Your current location is <br />
            Latitude: {this.state.latitude}
            <br /> Longitude: {this.state.longitude}.
          </Text>
          <Text
            size="medium"
            margin={{ left: "medium", top: "medium", right: "medium" }}
          >
            {this.state.customSelected ? (
              <div>
                This sensor is at {this.state.nearestSensor} and is{" "}
                {Math.floor(this.state.minimumDistance)} metres away.{" "}
              </div>
            ) : (
              <div>
                The nearest sensor is at {this.state.nearestSensor} and is{" "}
                {Math.floor(this.state.minimumDistance)} metres away.
              </div>
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
                  label: "Hostel Block B",
                  onClick: () => {
                    this.setSensorLocation(1);
                  }
                },
                {
                  label: "Academic Block A",
                  onClick: () => {
                    this.setSensorLocation(2);
                  }
                }
              ]}
            />
          </Box>
          <Box margin={{ top: "small" }}>
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
          <Box
            align="center"
            background={{
              color: this.decideColor(),
              dark: true
            }}
            style={{ color: "white", borderRadius: "10px" }}
            margin={{ top: "medium" }}
            pad={{
              left: "medium",
              right: "medium",
              top: "medium",
              bottom: "medium"
            }}
          >
            {this.statusShower()}
            <br /> PPM Level = {this.state.currentReading}
          </Box>
        </Box>
      </Grommet>
    );
  }
}

export default App;
