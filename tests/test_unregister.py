from urllib.parse import quote


def test_unregister_participant_removes_participant(client):
    # Arrange
    activity_name = "Chess Club"
    encoded_activity = quote(activity_name, safe="")
    participant_email = "michael@mergington.edu"

    # Act
    response = client.delete(
        f"/activities/{encoded_activity}/participants",
        params={"email": participant_email},
    )

    # Assert
    assert response.status_code == 200
    payload = response.json()
    assert payload["message"] == f"Unregistered {participant_email} from {activity_name}"

    updated = client.get("/activities").json()
    assert participant_email not in updated[activity_name]["participants"]


def test_unregister_from_missing_activity_returns_404(client):
    # Arrange
    missing_activity = quote("Unknown Club", safe="")

    # Act
    response = client.delete(
        f"/activities/{missing_activity}/participants",
        params={"email": "x@mergington.edu"},
    )

    # Assert
    assert response.status_code == 404
    assert response.json()["detail"] == "Activity not found"


def test_unregister_missing_participant_returns_404(client):
    # Arrange
    activity_name = "Chess Club"
    encoded_activity = quote(activity_name, safe="")
    unknown_email = "notsignedup@mergington.edu"

    # Act
    response = client.delete(
        f"/activities/{encoded_activity}/participants",
        params={"email": unknown_email},
    )

    # Assert
    assert response.status_code == 404
    assert response.json()["detail"] == "Participant not found in this activity"
