import { ref } from 'vue';

function usePoliticians() {
  const politicians = ref([]);
  const loading = ref(false);
  const error = ref(null);
  async function loadPoliticians() {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetch("/의원.csv");
      const csvText = await response.text();
      const lines = csvText.trim().split("\n");
      const headers = lines[0].split(",");
      const data = [];
      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        const obj = {
          id: i
          // CSV 행 번호를 id로 사용
        };
        headers.forEach((header, index) => {
          obj[header] = values[index] || "";
        });
        data.push(obj);
      }
      politicians.value = data;
      console.log("Loaded politicians:", data.slice(0, 3));
    } catch (err) {
      error.value = "의원 데이터를 불러오는데 실패했습니다.";
      console.error("Failed to load politicians:", err);
    } finally {
      loading.value = false;
    }
  }
  function parseCSVLine(line) {
    const result = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  }
  function findByRegion(regionName) {
    return politicians.value.find((p) => p.지역 === regionName);
  }
  return {
    politicians,
    loading,
    error,
    loadPoliticians,
    findByRegion
  };
}

export { usePoliticians as u };
//# sourceMappingURL=usePoliticians-DGzWK1_I.mjs.map
