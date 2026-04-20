from urllib.parse import quote


def test_signup_then_unregister_restores_activity_participants(client):
    # Arrange
    activity_name = "Science Club"
    encoded_activity = quote(activity_name, safe="")
    new_email = "workflow@mergington.edu"

    # Act
    signup_response = client.post(
        f"/activities/{encoded_activity}/signup",
        params={"email": new_email},
    )
    unregister_response = client.delete(
        f"/activities/{encoded_activity}/participants",
        params={"email": new_email},
    )

    # Assert
    assert signup_response.status_code == 200
    assert unregister_response.status_code == 200

    activities = client.get("/activities").json()
    assert new_email not in activities[activity_name]["participants"]
