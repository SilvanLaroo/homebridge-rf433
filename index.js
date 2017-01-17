var Service, Characteristic;
var pjson = require('./package.json');

module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;

    homebridge.registerAccessory('homebridge-rf433', 'RF433', RF433Accessory);
};

function RF433Accessory(log, config) {
  this.log = log;
  this.name = config.name || "RF 433 MHz";
  this.manufacturer = config.manufacturer || "N/A";
  this.version = config.version || pjson.version;
  this.serviceType = config.serviceType || "StatelessProgrammableSwitch";
  this.pin = config.pin || 0;
  this.systemCode = config.systemCode || "11111";
  this.unitCode = config.unitCode || "1";

  this.powerState = false;

  return this;
}

RF433Accessory.prototype.callCmdAsPromise = function(powerState, callback) {
  exec([path.join(__dirname, "node_modules/"),
    "--pin", options.pin,
    this.systemCode,
    this.unitCode
    (powerState ? '1', '0')
  ].join(' '), function (error, stdout, stderr) {
    error = error || stderr;
    if(error) {
      this.log("Something went wrong: " + error);
    }

    callback(error, stdout);
  }.bind(this));
}

RF433Accessory.prototype.switchOn = function(callback) {
  this.powerState = true;
  this.callCmdAsPromise(true, callback);
}

RF433Accessory.prototype.switchOff = function(callback) {
  this.powerState = false;
  this.callCmdAsPromise(false, callback);
}

RF433Accessory.prototype.setPowerState = function(powerState, callback) {
  if (powerState) {
    this.switchOn(callback);
  } else {
    this.switchOff(callback);
  }
}
RF433Accessory.prototype.getPowerState = function(callback) {
  callback(this.powerState);
});

RF433Accessory.prototype.getServices = function () {
    var services = [];

    this.informationService = new Service.AccessoryInformation();
    informationService
      .setCharacteristic(Characteristic.Name, this.name)
      .setCharacteristic(Characteristic.Manufacturer, this.manufacturer)
      .setCharacteristic(Characteristic.Version, this.version);
    services.push(this.informationService);

    if (this.serviceType == "Lightbulb" || this.serviceType == "lightbulb") {
      this.switchService = new Service.Lightbulb(this.name);
      switchService.getCharacteristic(Characteristic.On)
        .on('set', this.setPowerState.bind(this));
        .on('get', this.getPowerState.bind(this))
      services.push(this.switchService);
    } else if (this.serviceType == "Switch" || this.serviceType == "switch") {
      this.switchService = new Service.Switch(this.name);
      switchService.getCharacteristic(Characteristic.On)
        .on('set', this.setPowerState.bind(this));
        .on('get', this.getPowerState.bind(this))
      services.push(this.switchService);
    } else if (this.serviceType == "Fan" || this.serviceType == "fan") {
      this.switchService = new Service.Fan(this.name);
      switchService.getCharacteristic(Characteristic.On)
        .on('set', this.setPowerState.bind(this));
        .on('get', this.getPowerState.bind(this))
      services.push(this.switchService);
    } else {
      this.switchService = new Service.StatelessProgrammableSwitch(this.name);
      switchService.getCharacteristic(Characteristic.ProgrammableSwitchEvent)
        .on('set', this.setPowerState.bind(this));
      services.push(this.switchService);
    }

    return services;
};