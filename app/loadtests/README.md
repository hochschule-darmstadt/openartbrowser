# Loadtest Readme

The following guide shows all the steps necessary to perform the minimal load testing needed for this project. All configuration files can be edited to add new tests or change the existing ones for new functions.

## Locust

### Installation

```
$ python3 -m pip install locustio
```

### Configuration

The get requests which are fired can be defined in the TaskSet. This can be easily extended. More examples can be found in the Locust documentation.
Each request is executed with the same weight, this could be changed to give emphasis to special requests. The time in which the generated users are executing the given tasks can also be changed via the parameters.

### Start Test

To run Locust with the given configuration file simply execute the following code in your console:

```
$ locust -f path/to/file/test.py
```

In this project it would be located at:

```
$ locust -f app/loadtests/locust/test.py
```

After executing the web interface can be used to start the tests. It is locally reachable under

```
http://127.0.0.1:8089
```

on this page you can enter the host on which to execute the tests on, in this case it would be

```
https://openartbrowser.org
```

or the staging url if you would like to test there.
Then you enter the number of users to simulate and the rate how the users should be spawned.

To run Locust without the web interface simple change the run command to:

```
$ locust -f app/loadtests/locust/test.py --no-web -c 1000 -r 100
```

The no-web flag tells locust not to use the web interface, the `-c` specifies the number of Locust users to spawn, and the `-r` specifies the hatch rate, the number of users to spawn per second.

When using the web version, all generated test date can be found under the download tab.

When using the `--no-web` flag, you must add `--csv=exampleName` to your command.

## Artillery.io

### Installation

Once Node.js is installed, install Artillery with:

```
npm install -g artillery
```

Check for successful installation with:

```
artillery -V
```

### Configuration

The config file can be found under

```
loadtests/artillery/test.yml
```

It has the exact same functionality as the locust test file.
A flow of actions is defined which is executed by each user.
The duration and arrival rate define the time the phase is executed and how many virtual users arrive every second.

### Start Test

To run the test simply enter:

```
artillery run loadtests/artillery/test.yml
```

A intermediate report will be printed every 10 seconds to the terminal, followed by an aggregate report at the end of the test.
