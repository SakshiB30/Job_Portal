const formatDate = (dateString: string) => {
    const data = new Date(dateString);
    const options= {year: 'numeric' as const, month: 'short' as const};
    return data.toLocaleString('en-US', options);
}

const getBase64 = (file: File | null) => {
  return new Promise<string | null>((resolve, reject) => {
    if (!file) {
      resolve(null);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

function timeAgo(inputTime: string) {
  const past = new Date(inputTime);
  const now = new Date();

  // ❌ invalid date
  if (isNaN(past.getTime())) return "";

  const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds} sec ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;

  // ✅ fallback to formatted date (better UX)
  return formatDate(inputTime);
}

export {formatDate, timeAgo, getBase64};