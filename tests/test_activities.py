def test_get_activities_returns_expected_shape(client):
    # Arrange
    expected_keys = {"description", "schedule", "max_participants", "participants"}

    # Act
    response = client.get("/activities")

    # Assert
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "Chess Club" in data

    for activity in data.values():
        assert expected_keys.issubset(activity.keys())
        assert isinstance(activity["participants"], list)
