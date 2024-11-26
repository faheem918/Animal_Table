class AnimalTable {
  constructor(data, containerId, columns, sortableColumns) {
    this.data = data;
    this.container = document.getElementById(containerId);
    this.columns = columns;
    this.sortableColumns = sortableColumns;
    this.sortConfig = { column: "", direction: null };
    this.renderTable();
  }

  renderTable() {
    const table = document.createElement("table");
    table.className = "table table-bordered";
    table.innerHTML = this.renderHeader() + this.renderBody();
    this.container.innerHTML = "";
    this.container.appendChild(table);
  }

  renderHeader() {
    return `
        <thead>
          <tr>
            ${this.columns
              .map(
                (col) =>
                  `<th>${col.toUpperCase()} ${
                    this.sortableColumns.includes(col)
                      ? `<button class="btn btn-sm btn-link" onclick="animalTables['${this.container.id}'].sort('${col}')">Sort</button>`
                      : ""
                  }</th>`
              )
              .join("")}
            <th>ACTIONS</th>
          </tr>
        </thead>
      `;
  }

  renderBody() {
    return `
        <tbody>
          ${this.data
            .map(
              (row) =>
                `<tr>
                  ${this.columns
                    .map((col) => {
                      if (col === "image") {
                        return `<td>
                          <div class="image-hover" data-name="${row.name}">
                            <img src="${row[col]}" class="image-border">
                          </div>
                        </td>`;
                      }
                      if (col === "name") {
                        return `<td><b>${row[col]}</b></td>`;
                      }
                      return `<td>${row[col]}</td>`;
                    })
                    .join("")}
                  <td>
                    <button class="btn btn-sm btn-primary" onclick="animalTables['${
                      this.container.id
                    }'].edit(${row.id})">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="animalTables['${
                      this.container.id
                    }'].remove(${row.id})">Delete</button>
                  </td>
                </tr>`
            )
            .join("")}
        </tbody>
      `;
  }

  sort(column) {
    // Toggle sort direction or initialize with ascending for the new column
    if (this.sortConfig.column === column) {
      this.sortConfig.direction =
        this.sortConfig.direction === "asc" ? "desc" : "asc";
    } else {
      this.sortConfig = { column, direction: "asc" };
    }

    // Perform sorting
    this.data.sort((a, b) => {
      const aValue = a[column];
      const bValue = b[column];

      // Handle numeric sorting if values contain numbers
      if (this.isNumericField(aValue) && this.isNumericField(bValue)) {
        const aNum = this.extractNumber(aValue);
        const bNum = this.extractNumber(bValue);
        return this.sortConfig.direction === "asc" ? aNum - bNum : bNum - aNum;
      }

      // Handle string-based sorting (case-insensitive)
      if (typeof aValue === "string" && typeof bValue === "string") {
        const comparison = aValue.localeCompare(bValue, undefined, {
          sensitivity: "base",
        });
        return this.sortConfig.direction === "asc" ? comparison : -comparison;
      }

      // Default comparison fallback
      return 0;
    });

    this.renderTable();
  }

  // Helper method to extract numeric values from strings
  extractNumber(value) {
    if (typeof value === "string") {
      const match = value.match(/[\d.]+/); // Match numbers, including decimals
      return match ? parseFloat(match[0]) : 0; // Convert to number, default to 0 if no match
    }
    return typeof value === "number" ? value : 0; // Return numeric value or 0
  }
  isNumericField(value) {
    return typeof value === "string" && /\d/.test(value);
  }

  remove(id) {
    this.data = this.data.filter((item) => item.id !== id);
    this.renderTable();
  }

  edit(id) {
    const item = this.data.find((animal) => animal.id === id);
    if (!item) return;

    // Prompt user to edit fields, pre-filling current values
    const newName = prompt("Edit name:", item.name)?.trim();
    const newLocation = prompt("Edit location:", item.location)?.trim();
    const newSize = prompt("Edit size (e.g., '5 ft'):", item.size)?.trim();
    const newImage = prompt("Edit image URL (optional):", item.image)?.trim();

    // Validation: Check for empty fields
    if (!newName || !newLocation || !newSize) {
      alert("All fields (except the image URL) are required.");
      return;
    }

    // Validation: Prevent duplicate names (excluding the current item being edited)
    const isDuplicate = this.data.some(
      (animal) =>
        animal.name.toLowerCase() === newName.toLowerCase() && animal.id !== id
    );
    if (isDuplicate) {
      alert("An animal with this name already exists!");
      return;
    }

    // Validation: Ensure size contains valid numeric data
    const sizeMatch = newSize.match(/(\d+(\.\d+)?)/); // Extract numeric value
    if (!sizeMatch || parseFloat(sizeMatch[1]) <= 0) {
      alert(
        "Invalid size. Please provide a valid positive number (e.g., '5 ft')."
      );
      return;
    }

    // Update item fields
    item.name = newName;
    item.location = newLocation;
    item.size = newSize;
    item.image = newImage || "./image/default.png"; // Default image if none provided

    // Re-render the table to reflect changes
    this.renderTable();
  }

  add(newAnimal) {
    // Validation: Prevent duplicates by name
    if (this.data.some((animal) => animal.name === newAnimal.name)) {
      alert("Animal with this name already exists!");
      return;
    }

    // Validation: Ensure size is a valid number
    if (isNaN(parseFloat(newAnimal.size)) || parseFloat(newAnimal.size) <= 0) {
      alert("Invalid size. Please enter a valid positive number.");
      return;
    }

    // Assign a default image if none is provided
    if (!newAnimal.image) {
      newAnimal.image = "./image/default.png"; // Default image path
    }

    // Assign a unique ID
    newAnimal.id = this.data.length
      ? Math.max(...this.data.map((animal) => animal.id)) + 1
      : 1;

    // Add the new animal to the data and re-render the table
    this.data.push(newAnimal);
    this.renderTable();
  }
}

// Helper function to open a prompt for adding new animals
function addAnimalForm(tableId) {
  const name = prompt("Enter the animal's name:");
  const location = prompt("Enter the animal's location:");
  const size = prompt("Enter the animal's size (e.g., '5 ft'):");
  const image = prompt("Enter the animal's image URL (optional):");

  if (name && location && size) {
    animalTables[tableId].add({ name, location, size, image });
  } else {
    alert("All fields except image are required.");
  }
}

const animalTables = {};

const bigCats = [
  {
    id: 1,
    name: "Lion",
    location: "Africa",
    size: "8 ft",
    image: "./image/Lion.png",
  },
  {
    id: 2,
    name: "Tiger",
    location: "Asia",
    size: "10 ft",
    image: "./image/Tiger.png",
  },
  {
    id: 3,
    name: "Leopard",
    location: "Africa and Asia",
    size: "5 ft",
    image: "./image/Leopard.png",
  },
  {
    id: 4,
    name: "Cheetah",
    location: "Africa",
    size: "5 ft",
    image: "./image/Cheetah.png",
  },
  {
    id: 5,
    name: "Caracal",
    location: "Africa",
    size: "3 ft",
    image: "./image/Caracal.png",
  },
  {
    id: 6,
    name: "Jaguar",
    location: "Amazon",
    size: "5 ft",
    image: "./image/Jaguar.png",
  },
];

const dogs = [
  {
    id: 1,
    name: "Rottweiler",
    location: "Germany",
    size: "2 ft",
    image: "./image/Rotwailer.png",
  },
  {
    id: 2,
    name: "German Shepherd",
    location: "Germany",
    size: "2 ft",
    image: "./image/German Shephered.png",
  },
  {
    id: 3,
    name: "Labrador",
    location: "UK",
    size: "2 ft",
    image: "./image/Labrodar.png",
  },
  {
    id: 4,
    name: "Alabai",
    location: "Turkey",
    size: "4 ft",
    image: "./image/Alabai.png",
  },
];

const bigFish = [
  {
    id: 1,
    name: "Humpback Whale",
    location: "Atlantic Ocean",
    size: "15 ft",
    image: "./image/Humpback Whale.png",
  },
  {
    id: 2,
    name: "Killer Whale",
    location: "Atlantic Ocean",
    size: "12 ft",
    image: "./image/Killer Whale.png",
  },
  {
    id: 3,
    name: "Tiger Shark",
    location: "Ocean",
    size: "8 ft",
    image: "./image/Tiger Shark.png",
  },
  {
    id: 4,
    name: "Hammerhead Shark",
    location: "Ocean",
    size: "8 ft",
    image: "./image/Hammerhead Shark.png",
  },
];

animalTables["big-cats-table"] = new AnimalTable(
  bigCats,
  "big-cats-table",
  ["name", "location", "size", "image"],
  ["name", "location", "size"]
);
animalTables["dogs-table"] = new AnimalTable(
  dogs,
  "dogs-table",
  ["name", "location", "size", "image"],
  ["name", "location"]
);
animalTables["big-fish-table"] = new AnimalTable(
  bigFish,
  "big-fish-table",
  ["name", "location", "size", "image"],
  ["size"]
);
