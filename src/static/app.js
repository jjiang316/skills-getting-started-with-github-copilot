document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  function showMessage(type, text) {
    messageDiv.textContent = text;
    messageDiv.className = type;
    messageDiv.classList.remove("hidden");

    setTimeout(() => {
      messageDiv.classList.add("hidden");
    }, 5000);
  }

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch(`/activities?t=${Date.now()}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Failed to load activities: ${response.status}`);
      }

      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;
        const participants = Array.isArray(details.participants) ? details.participants : [];

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
        `;

        const participantsSection = document.createElement("div");
        participantsSection.className = "participants-section";

        const participantsTitle = document.createElement("p");
        participantsTitle.className = "participants-title";
        participantsTitle.textContent = "Participants";
        participantsSection.appendChild(participantsTitle);

        if (participants.length === 0) {
          const emptyState = document.createElement("p");
          emptyState.className = "participants-empty";
          emptyState.textContent = "No one has signed up yet.";
          participantsSection.appendChild(emptyState);
        } else {
          const participantsList = document.createElement("ul");
          participantsList.className = "participants-list";

          participants.forEach((participantEmail) => {
            const participantItem = document.createElement("li");
            participantItem.className = "participants-item";

            const participantEmailText = document.createElement("span");
            participantEmailText.className = "participant-email";
            participantEmailText.textContent = participantEmail;

            const removeButton = document.createElement("button");
            removeButton.type = "button";
            removeButton.className = "remove-participant-btn";
            removeButton.setAttribute("aria-label", `Unregister ${participantEmail}`);
            removeButton.dataset.activityName = name;
            removeButton.dataset.participantEmail = participantEmail;
            removeButton.innerHTML = "&times;";

            participantItem.appendChild(participantEmailText);
            participantItem.appendChild(removeButton);
            participantsList.appendChild(participantItem);
          });

          participantsSection.appendChild(participantsList);
        }

        activityCard.appendChild(participantsSection);

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        showMessage("success", result.message);
        signupForm.reset();
        await fetchActivities();
      } else {
        showMessage("error", result.detail || "An error occurred");
      }
    } catch (error) {
      showMessage("error", "Failed to sign up. Please try again.");
      console.error("Error signing up:", error);
    }
  });

  activitiesList.addEventListener("click", async (event) => {
    const removeButton = event.target.closest(".remove-participant-btn");
    if (!removeButton) {
      return;
    }

    const activityName = removeButton.dataset.activityName;
    const participantEmail = removeButton.dataset.participantEmail;

    if (!activityName || !participantEmail) {
      showMessage("error", "Unable to unregister participant.");
      return;
    }

    removeButton.disabled = true;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activityName)}/participants?email=${encodeURIComponent(participantEmail)}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (response.ok) {
        showMessage("success", result.message);
        await fetchActivities();
      } else {
        showMessage("error", result.detail || "Unable to unregister participant.");
      }
    } catch (error) {
      showMessage("error", "Failed to unregister participant. Please try again.");
      console.error("Error unregistering participant:", error);
    } finally {
      removeButton.disabled = false;
    }
  });

  // Initialize app
  fetchActivities();
});
