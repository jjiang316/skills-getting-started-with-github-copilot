from urllib.parse import quote


def test_signup_for_activity_adds_participant(client):
    # Arrange
    activity_name = "Chess Club"
    encoded_activity = quote(activity_name, safe="")
    new_email = "newstudent@mergington.edu"

    # Act
    response = client.post(f"/activities/{encoded_activity}/signup", params={"email": new_email})

    # Assert
    assert response.status_code == 200
    payload = response.json()
    assert payload["message"] == f"Signed up {new_email} for {activity_name}"

    updated = client.get("/activities").json()
    assert new_email in updated[activity_name]["participants"]


def test_signup_for_missing_activity_returns_404(client):
    # Arrange
    missing_activity = quote("Unknown Club", safe="")

    # Act
    response = client.post(f"/activities/{missing_activity}/signup", params={"email": "x@mergington.edu"})

    # Assert
    assert response.status_code == 404
    assert response.json()["detail"] == "Activity not found"


def test_signup_duplicate_participant_returns_400(client):
    # Arrange
    activity_name = "Chess Club"
    encoded_activity = quote(activity_name, safe="")
    existing_email = "michael@mergington.edu"

    # Act
    response = client.post(
        f"/activities/{encoded_activity}/signup",
        params={"email": existing_email},
    )

    # Assert
    assert response.status_code == 400
    assert response.json()["detail"] == "Student already signed up for this activity"
