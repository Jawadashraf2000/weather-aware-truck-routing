from django.test import SimpleTestCase

from .services import RouteAnalysisService


class SampleCheckpointsTests(SimpleTestCase):
    def test_last_checkpoint_distance_matches_route_distance(self):
        route_distance_meters = 50 * 1609.34

        checkpoints = RouteAnalysisService.sample_checkpoints(
            coordinates=[(-100, 40), (-99, 40)],
            total_duration_sec=3600,
            total_distance_meters=route_distance_meters,
            interval_miles=25,
        )

        self.assertEqual(
            checkpoints[-1]["distance_miles"],
            round(route_distance_meters / 1609.34, 1),
        )
        self.assertEqual(
            [checkpoint["distance_miles"] for checkpoint in checkpoints],
            [0.0, 25.0, 50.0],
        )
        self.assertEqual(checkpoints[-1]["lon"], -99)
