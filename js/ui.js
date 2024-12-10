import { openDB } from "https://unpkg.com/idb?module";
import { 
  addGig,
  getGigs,
  deleteGig,
  updateGig,
} from "/js/firebaseDB.js";

// --- Constants ---
const STORAGE_THRESHOLD = 0.8;

// Initialize Sidenav and Forms
document.addEventListener("DOMContentLoaded", function () {
  const menus = document.querySelector(".sidenav");
  M.Sidenav.init(menus, { edge: "right" });

  const forms = document.querySelector(".side-form");
  M.Sidenav.init(forms, { edge: "left" });

  var elems = document.querySelectorAll('select');
  M.FormSelect.init(elems);

  var elems2 = document.querySelectorAll('.materialboxed');
  M.Materialbox.init(elems2);

  // Check storage usage
  checkStorageUsage();

  // Request persistent storage
  requestPersistentStorage();

  
});

// Register Service Worker
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/serviceworker.js")
      .then((req) => console.log("Service Worker Registered!", req))
      .catch((err) => console.log("Service Worker registration failed", err));
  }


// --- Database Operations ---

// Create or Get IndexedDB database instance
let dbPromise;
async function getDB() {
  if (!dbPromise) {
    dbPromise = openDB("taskManager", 1, {
      upgrade(db) {
        const store = db.createObjectStore("tasks", {
          keyPath: "id",
          autoIncrement: true,
        });
        store.createIndex("status", "status");
        store.createIndex("synced", "synced");
      },
    });
  }
  return dbPromise;
}

// Sync unsynced tasks from IndexedDB to Firebase

export async function syncTasks() {
  const db = await getDB();
  const tx = db.transaction("tasks", "readonly");
  const store = tx.objectStore("tasks");

  // Fetch all unsynced tasks
  const tasks = await store.getAll();
  await tx.done; // Complete the transaction used to read tasks

  for (const task of tasks) {
    if (!task.synced && navigator.onLine) {
      try {
        // Create a new task object with only the fields needed for Firebase
        const taskToSync = {
          title: task.title,
          location: task.location,
          gigDate: task.gigDate,
          gigTime: task.gigTime,
          gigAttend: task.gigAttend,
        };

        // Send the task to Firebase and get the new ID
        const savedTask = await addGig(taskToSync);

        // Replace temporary ID with Firebase ID and mark as synced
        const txUpdate = db.transaction("tasks", "readwrite");
        const storeUpdate = txUpdate.objectStore("tasks");

        // Remove the temporary entry if it exists
        await storeUpdate.delete(task.id);
        // Add the updated task with Firebase ID
        await storeUpdate.put({ ...task, id: savedTask.id, synced: true });
        await txUpdate.done;
      } catch (error) {
        console.error("Error syncing task:", error);
      }
    }
  }
}


// Add Task with Transaction
async function addTask(task) {
  const db = await getDB();
  let taskId;

if(navigator.onLine){
  try{
    const savedTask = await addGig(task);
    taskId = savedTask.id;
    const tx = db.transaction("tasks", "readwrite");
    const store = tx.objectStore("tasks");
    await store.put({ ...task, id: taskId, synced: true });
    await tx.done;
  } catch (error){
    console.error("Error adding task to Firebase:", error);
    }
  } else {
    taskId = `temp-${Date.now()}`;
    const taskToStore = { ...task, id: taskId, synced: false, operation:'create' };
    const tx = db.transaction("tasks", "readwrite");
    const store = tx.objectStore("tasks");
    await store.put(taskToStore);
    await tx.done;
  }

  checkStorageUsage();
  return { ...task, id: taskId };
}

  /* Misplaced
  
  if(!taskToStore.id){
    console.error("Failed to generate a valid ID for the task.");
    return; //Exit if ID is invalid
  }



  // Start a transaction
  const tx = db.transaction("tasks", "readwrite");
  const store = tx.objectStore("tasks");

  // Add task to store
  await store.put(taskToStore);

  // Complete transaction
  await tx.done;
}
  // Update storage usage
  checkStorageUsage();

  //Return task with ID
  return { ...task, id:taskId };
}

*/

// Edit Task with Transaction
async function editTask(id, updatedData) {
  if (!id) {
    console.error("Invalid ID passed to editTask.");
    return;
  }

  const db = await getDB();

  if (navigator.onLine) {
    try {
      await updateGig(id, updatedData);
      // Update in IndexedDB as well
      const tx = db.transaction("tasks", "readwrite");
      const store = tx.objectStore("tasks");
      await store.put({ ...updatedData, id: id, synced: true });
      await tx.done;

      // Reload the entire task list to reflect the updates
      loadTasks(); // Call loadTasks here to refresh the UI
    } catch (error) {
      console.error("Error updating task in Firebase:", error);
    }
  } else {
    // If offline, make an IndexedDB transaction
    const tx = db.transaction("tasks", "readwrite");
    const store = tx.objectStore("tasks");
    await store.put({ ...updatedData, id: id, synced: false, operation: 'update' });
    await tx.done;
    loadTasks(); // Refresh the UI with loadTasks here as well
  }
}





// Delete Task with Transaction
async function deleteTask(id) {
  if (!id) {
    console.error("Invalid ID passed to deleteTask.");
    return;
  }
  const db = await getDB();
  if (navigator.onLine) {
    try {
      await deleteGig(id);
    } catch (error) {
      console.error("Error deleting task from Firebase:", error);
    }
  }

  // Start a transaction
  // Delete task by id
  const tx = db.transaction("tasks", "readwrite");
  const store = tx.objectStore("tasks");

  try{
    await store.delete(id);
  } catch (error) {
    console.error("Error deleting task from IndexDB:", error);
  }

  // Complete transaction
  await tx.done;

  // Remove task from UI
  const taskCard = document.querySelector(`[data-id="${id}"]`);
  if (taskCard) {
    taskCard.remove();
  }

  // Update storage usage
  checkStorageUsage();
}

// Load Tasks with Transaction
export async function loadTasks() {
  const db = await getDB();

  const taskContainer = document.querySelector(".tasks");
  taskContainer.innerHTML = ""; // Clear current tasks

  //Load from FireBase if online
  if (navigator.onLine){
    const firebaseTasks = await getGigs();
    // Start a transaction (read-only)
    const tx = db.transaction("tasks", "readwrite");
    const store = tx.objectStore("tasks");

    for (const task of firebaseTasks){
      await store.put({ ...task, synced: true });
      displayTask(task); // Display each task in the UI
    }

    await tx.done;

  } else {
    //Load task from IndexedDB if offline
    // Start a transaction (read-only)
    const tx = db.transaction("tasks", "readonly");
    const store = tx.objectStore("tasks");

     // Get all tasks
    const tasks = await store.getAll();

    tasks.forEach((task) => {
      displayTask(task);
    });

    // Complete transaction
    await tx.done;
  }
}

// Display Task using the existing HTML structure
function displayTask(task) {
  const taskContainer = document.querySelector(".tasks");

  // Check if the task already exists in the UI and remove it
  const existingTask = taskContainer.querySelector(`[data-id="${task.id}"]`);
  if (existingTask) {
    existingTask.remove();
  }

  const html = `
    <div class="card-panel white row valign-wrapper" data-id="${task.id}">
      <div class="col s2">
        <img
          src="/images/c-p1Thumb.png"
          class="responsive-img"
          alt="Task icon"
          style="max-width: 100%; height: auto"
        />
      </div>
      <div class="task-detail col s8">
        <h5 class="task-title black-text">${task.title}</h5>
        <div class="task-location">Location: ${task.location}</div>
        <div class="task-gigDate">Date: ${task.gigDate}</div>
        <div class="task-gigTime"> Time: ${task.gigTime}</div>
        <div class="task-gigAttend">Attending?: ${task.gigAttend}</div>
      </div>
      <div class="col s2 right-align">
        <button class="task-delete btn-flat" aria-label="Delete task">
          <i class="material-icons black-text text-darken-1" style="font-size: 30px">delete</i>
        </button>
        <button class="task-edit btn-flat" aria-label="Edit task">
          <i class="material-icons black-text text-darken-1" style="font-size: 30px">edit</i>
        </button>
      </div>
    </div>
  `;
  taskContainer.insertAdjacentHTML("beforeend", html);
  

  // Attach delete event listener
  const deleteButton = taskContainer.querySelector(
    `[data-id="${task.id}"] .task-delete`
  );
  deleteButton.addEventListener("click", () => deleteTask(task.id));

  // Attach edit event listener
  const editButton = taskContainer.querySelector(
    `[data-id="${task.id}"] .task-edit`
  );
  editButton.addEventListener("click", () => 
    openEditForm(task.id, task.title, task.location, task.gigDate, task.gigTime, task.gigAttend)
  );

}

// Add/Edit Task Button Listener
const addTaskButton = document.querySelector("#form-action-btn");
addTaskButton.addEventListener("click", async () => {
  const titleInput = document.querySelector("#title");
  const locationInput = document.querySelector("#location");
  const gigDateInput = document.querySelector("#gigDate");
  const gigTimeInput = document.querySelector("#gigTime");
  const gigAttendInput = document.querySelector("#gigAttend");
  const taskIdInput = document.querySelector("#task-id");
  const formActionButton = document.querySelector("#form-action-btn");

  // Check to see if editing or adding
  const taskId = taskIdInput.value;
  const taskData = {
    title: titleInput.value,
    location: locationInput.value,
    gigDate: gigDateInput.value,
    gigTime: gigTimeInput.value,
    gigAttend: gigAttendInput.value
  };

  // Add a new task
  if (!taskId) {
    const savedTask = await addTask(taskData); // Add task to IndexedDB
    displayTask(savedTask); // Add task to the UI
  } else {
    await editTask(taskId, taskData);
    loadTasks();
  }
  formActionButton.textContent = "Add";
  closeForm();
});

//Open Edit form
function openEditForm(id, title, location, gigDate, gigTime, gigAttend){
  const titleInput = document.querySelector("#title");
  const locationInput = document.querySelector("#location");
  const gigDateInput = document.querySelector("#gigDate");
  const gigTimeInput = document.querySelector("#gigTime");
  const gigAttendInput = document.querySelector("#gigAttend");
  const taskIdInput = document.querySelector("#task-id");
  const formActionButton = document.querySelector("#form-action-btn");
  titleInput.value = title;
  locationInput.value = location;
  gigDateInput.value = gigDate;
  gigTimeInput.value = gigTime;
  gigAttendInput.value = gigAttend;
  taskIdInput.value = id;
  formActionButton.textContent = "Edit"

  M.updateTextFields();
  
// Open the side for
  const forms = document.querySelector(".side-form");
  const instance = M.Sidenav.getInstance(forms);
  instance.open();
}

// Helper function to reset the form after use
function closeForm() {
const titleInput = document.querySelector("#title");
const locationInput = document.querySelector("#location");
const gigDateInput = document.querySelector("#gigDate");
const gigTimeInput = document.querySelector("#gigTime");
const gigAttendInput = document.querySelector("#gigAttend");
const taskIdInput = document.querySelector("#task-id");
const formActionButton = document.querySelector("#form-action-btn");
titleInput.value = "";
locationInput.value = "";
gigDateInput.value = "";
gigTimeInput.value = "";
gigAttendInput.value = "";
taskIdInput.value = "";
formActionButton.textContent = "Add";
const forms = document.querySelector(".side-form");
const instance = M.Sidenav.getInstance(forms);
instance.close();
}

/* Misplaced

  formActionButton.onclick = async () => {
    const updatedTask = {
      title: titleInput.value,
      location: locationInput.value,
      gigDate: gigDateInput.value,
      gigTime: gigTimeInput.value,
      gigAttend: gigAttendInput.value,
    };

    await editTask(id, updatedTask);
    //loadTasks();
    closeForm();
  };

  */

  async function checkStorageUsage() {
    if (navigator.storage && navigator.storage.estimate) {
      const { usage, quota } = await navigator.storage.estimate();
      const usageInMB = (usage / (1024 * 1024)).toFixed(2);
      const quotaInMB = (quota / (1024 * 1024)).toFixed(2);
      console.log(`Storage used: ${usageInMB} MB of ${quotaInMB} MB`);
  
      const storageInfo = document.querySelector("#storage-info");
      if (storageInfo) {
        storageInfo.textContent = `Storage used: ${usageInMB} MB of ${quotaInMB} MB`;
      }
  
      const storageWarning = document.querySelector("#storage-warning");
      if (usage / quota > STORAGE_THRESHOLD) {
        if (storageWarning) {
          storageWarning.textContent = "Warning: Running low on storage space.";
          storageWarning.style.display = "block";
        }
      } else if (storageWarning) {
        storageWarning.textContent = "";
        storageWarning.style.display = "none";
      }
    }
  }

// Request persistent storage
async function requestPersistentStorage() {
  if (navigator.storage && navigator.storage.persist) {
    const isPersistent = await navigator.storage.persist();
    console.log(`Persistent storage granted: ${isPersistent}`);

    const storageMessage = document.querySelector("#persistent-storage-info");
    if (storageMessage) {
      storageMessage.textContent = isPersistent
        ? "Persistent storage granted!"
        : "Data might be cleared under storage pressure.";
      storageMessage.classList.toggle("green-text", isPersistent);
      storageMessage.classList.toggle("red-text", !isPersistent);
    }
  }
}

// Event listener to detect online status and sync
window.addEventListener("online", syncTasks);
window.addEventListener("online", loadTasks);