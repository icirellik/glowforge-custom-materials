const MAX_MOTOR_SPEED = 8500;
const MIN_UI_SPEED = 100;
const MAX_UI_SPEED = 1000;

const MILLIMETERS_IN_INCH = 25.4;
const STEP_SIZE = .01875;
const STANDARD_SCAN_GAP_INCHES = STEP_SIZE / MILLIMETERS_IN_INCH;

/**
 * A helper function that rounds to the nearest 5.
 * @param {*} number
 */
function roundToNearest5(number) {
  return 5 * Math.round(number / 5)
}

/**
 * Best guess is that this is the maximum vertical rampup speed. It makes sense
 * that this value could be higher for emgraves as there is no y axis motion
 */
function getMaxVRSpeed(minSpeed, maxSpeed) {
  const speedDifference = maxSpeed - minSpeed;
  const uiSpeedRange = MAX_UI_SPEED - MIN_UI_SPEED
  const vrSpeed = speedDifference / MAX_MOTOR_SPEED * uiSpeedRange + MIN_UI_SPEED;
  return 100 * Math.round(vrSpeed / 100)
}

/**
 * Converts a Glowforge internal speed to the GFUI Speed.
 */
export function toDisplaySpeed(rawSpeed, minSpeed, maxSpeed) {
  const maxVRSpeed = getMaxVRSpeed(minSpeed, maxSpeed) - MIN_UI_SPEED;
  const speed = (rawSpeed - minSpeed) / (maxSpeed - minSpeed) * maxVRSpeed + MIN_UI_SPEED;
  return Math.round(speed)
}

/**
 * Converts a Glowforge UI speed to a Glowforge internal speed.
 */
export function toRealSpeed(displaySpeed, minSpeed, maxSpeed) {
  return (displaySpeed - minSpeed) / (getMaxVRSpeed(minSpeed, maxSpeed) - MIN_UI_SPEED) * (maxSpeed - minSpeed) + minSpeed
}

// Engrave conversion settings.
export function toDisplayEngraveSpeed(rawSpeed) {
  return toDisplaySpeed(rawSpeed, 100, 8500);
}

export function toRealEngraveSpeed(displaySpeed) {
  return toRealSpeed(displaySpeed, 100, 8500);
}

// Cut conversion settings.
export function toDisplayCutSpeed(rawSpeed) {
  return toDisplaySpeed(rawSpeed, 100, 4000);
}

export function toRealCutSpeed(displaySpeed) {
  return toRealSpeed(displaySpeed, 100, 4000);
}

// Power conversion settings.
export function toDisplayPower(power, text=true) {
  if (text) {
    return (power === 100) ? 'Max' : power + 1;
  }
  return power + 1;
}

export function toRealPower(displayPower) {
  return displayPower - 1;
}

// Lines per inch.
export function toDisplayLinesPerInch(scanGap) {
  if (!scanGap || scanGap < 0) {
    return 0;
  }
  return roundToNearest5(1 / (scanGap * STANDARD_SCAN_GAP_INCHES))
}

export function toRealLinesPerInch(scanGap) {
  return Math.round(1 / (scanGap * STANDARD_SCAN_GAP_INCHES))
}

export function toSteps(linesPerInch) {
  return Math.round(1 / linesPerInch / STANDARD_SCAN_GAP_INCHES)
}
