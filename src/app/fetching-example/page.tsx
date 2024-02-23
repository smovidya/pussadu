// server side rendering

export default async function Page() {
  const res = await fetch("https://jsonplaceholder.typicode.com/posts", {
    next: { revalidate: 5 }, // Will revalidate every 5 minute
  });

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary.
    throw new Error(`Failed to fetch the data`)
  }
  const posts = await res.json();

  return (
    <div>
      <h1>Posts</h1>
      <ul>
        {posts.map((post : any) => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </div>
  )
}