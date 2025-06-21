<script lang="ts">
	let fileInput: HTMLInputElement; // Reference to the file input element
	let message = $state(""); // Message to display upload status

	const uploadFile = async () => {
		const selectedFile = fileInput?.files?.[0];
		if (!selectedFile) {
			message = "Please select a file to upload.";
			return;
		}

		const formData = new FormData();
		formData.append("file", selectedFile);

		try {
			const response = await fetch("/uploadImage", {
				method: "POST",
				body: formData
			});

			if (response.ok) {
				const result = await response.json();
				message = "File uploaded successfully!";
				console.log("Upload result:", result);
			} else {
				const error = await response.text();
				message = `Error: ${error}`;
				console.error("Upload error:", error);
			}
		} catch (err) {
			message = "An error occurred while uploading the file.";
			console.error("Error:", err);
		}
	};
</script>

<div class="mx-auto mt-10 max-w-lg rounded-lg bg-white p-6 shadow-md">
	<h1 class="mb-4 text-2xl font-bold text-gray-800">Upload a File</h1>
    <form onsubmit={uploadFile} class="space-y-4">
		<div>
			<label for="file" class="mb-2 block text-sm font-medium text-gray-700">
				Select a file:
				<input
					id="file"
					type="file"
					bind:this={fileInput}
					accept=".png,.jpg,.jpeg"
					class="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border file:border-gray-300 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200"
				/>
			</label>
		</div>
		<button
			type="submit"
			class="w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
		>
			Upload
		</button>
	</form>
	{#if message}
		<p
			class="mt-4 text-sm font-medium"
			class:text-green-600={message.startsWith("File uploaded successfully")}
			class:text-red-600={message.startsWith("Error")}
		>
			{message}
		</p>
	{/if}
</div>
