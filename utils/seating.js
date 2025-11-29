// utils/seating.js
/**
 * classroom: { rows, benchesPerRow, seatsPerBench, capacity, pattern, gap }
 * students: array of student docs sorted in desired order (e.g., by class then roll)
 *
 * Returns seating array:
 *  [{ seatIndex, row, bench, seatPosition (1..seatsPerBench), student: {...} | null }, ...]
 */
function generateSeating(classroom, students) {
  const rows = classroom.rows;
  const benches = classroom.benchesPerRow;
  const perBench = classroom.seatsPerBench;
  const pattern = classroom.pattern || "normal";
  const gap = classroom.gap || 0;

  const seatsPerRow = benches * perBench;
  const totalCapacity = rows * seatsPerRow;

  // Build seat slots in row order: row 1 bench1 seats..., bench2 seats..., row2...
  let seatSlots = [];
  let seatIndex = 0;
  for (let r = 1; r <= rows; r++) {
    for (let b = 1; b <= benches; b++) {
      for (let s = 1; s <= perBench; s++) {
        seatIndex++;
        seatSlots.push({ seatIndex, row: r, bench: b, seatPosition: s });
      }
    }
  }

  // Trim to capacity if capacity < total slots
  const cap = Math.min(classroom.capacity || totalCapacity, seatSlots.length);
  seatSlots = seatSlots.slice(0, cap);

  // Prepare list of students to place (may include multiple classes mixed)
  // students is an array of objects: { _id, rollNumber, className, fullName }
  // We'll work with indices and then map into seatSlots
  let seating = new Array(cap).fill(null);

  if (pattern === "normal") {
    for (let i = 0; i < cap; i++) {
      const stud = students[i] || null;
      seating[i] = {
        ...seatSlots[i],
        student: stud ? { id: stud._id, rollNumber: stud.rollNumber, className: stud.className, fullName: stud.fullName } : null
      };
    }
  } else if (pattern === "gap" && gap > 0) {
    // place students with spacing:
    let pos = 0;
    for (let i = 0; i < students.length && pos < cap; i++) {
      seating[pos] = {
        ...seatSlots[pos],
        student: { id: students[i]._id, rollNumber: students[i].rollNumber, className: students[i].className, fullName: students[i].fullName }
      };
      pos += gap;
      if (pos >= cap && i < students.length - 1) {
        // when pos exceeds capacity, wrap to next available slot (seek first empty)
        pos = seating.findIndex((s) => s === null);
        if (pos === -1) break;
      }
    }
    // fill other slots with remaining students or empty
    let fillIdx = 0;
    for (let i = 0; i < cap; i++) {
      if (!seating[i]) {
        // find next student unplaced
        while (fillIdx < students.length && seating.some(s => s && s.student && String(s.student.id) === String(students[fillIdx]._id))) {
          fillIdx++;
        }
        const stud = students[fillIdx] || null;
        seating[i] = {
          ...seatSlots[i],
          student: stud ? { id: stud._id, rollNumber: stud.rollNumber, className: stud.className, fullName: stud.fullName } : null
        };
        fillIdx++;
      }
    }
  } else if (pattern === "zigzag") {
    // zigzag across benches per row: alternate direction of benches every row
    // construct seatSlots grouped by row
    let groupedByRow = [];
    for (let r = 1; r <= rows; r++) {
      const start = (r - 1) * seatsPerRow;
      const rowSlots = seatSlots.slice(start, start + seatsPerRow);
      if (r % 2 === 0) rowSlots.reverse();
      groupedByRow = groupedByRow.concat(rowSlots);
    }
    for (let i = 0; i < cap; i++) {
      const slot = groupedByRow[i];
      const stud = students[i] || null;
      seating[i] = {
        ...slot,
        student: stud ? { id: stud._id, rollNumber: stud.rollNumber, className: stud.className, fullName: stud.fullName } : null
      };
    }
  } else {
    // fallback to normal
    for (let i = 0; i < cap; i++) {
      const stud = students[i] || null;
      seating[i] = {
        ...seatSlots[i],
        student: stud ? { id: stud._id, rollNumber: stud.rollNumber, className: stud.className, fullName: stud.fullName } : null
      };
    }
  }

  return seating;
}

module.exports = { generateSeating };
