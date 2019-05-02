import { PositionService } from "./position-service"
import { Location } from "./location"

test('Distance formatting', () => {
  let result;

  result = PositionService.formatDistance(1000);

  expect(result).toBe("1 km");

  result = PositionService.formatDistance(999);

  expect(result).toBe("999 m");
});

test('Distance', () => {
  let result1, result2;
  let l1 = new Location();
  l1.latitude = 51.5074;
  l1.longitude = 0.1278;
  let l2 = new Location();
  l2.latitude = 50.0755;
  l2.longitude = 14.4378;
  result1 = PositionService.distanceFromCoords(l1, l2);

  expect(result1).toBe(1016696.3593536292);

  result2 = PositionService.distanceFromCoords(l2, l1);

  expect(result2).toBe(result1);
});

test('Bearing', () => {
  let result;
  let l1 = new Location();
  l1.latitude = 51.5074;
  l1.longitude = 0.1278;
  let l2 = new Location();
  l2.latitude = 50.0755;
  l2.longitude = 14.4378;
  result = PositionService.absBearing(l1, l2);

  expect(Math.floor(result)).toBe(93);

  result = PositionService.absBearing(l2, l1);

  expect(Math.floor(result)).toBe(284);
});