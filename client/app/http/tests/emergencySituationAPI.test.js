import { auth } from "../../config/firebase";
import { scrape } from "../emergencySituationAPI";

describe("scrape", () => {
	beforeEach(() => {
		global.fetch = jest.fn();
	});

	afterEach(() => {
		jest.resetAllMocks();
	});

	it("should retrieve scrape info for the user", async () => {
		const mockUserId = "123";
		const mockToken = "mockToken";
		const mockCurrentUser = {
			uid: mockUserId,
			getIdToken: jest.fn().mockResolvedValue(mockToken),
		};

		Object.defineProperty(auth, "currentUser", {
			get: jest.fn().mockReturnValue(mockCurrentUser),
		});

		const mockResponse = {
			ok: true,
			json: jest.fn().mockResolvedValue({}),
		};
		const mockFetch = jest.fn().mockResolvedValue(mockResponse);
		global.fetch = mockFetch;

		const result = await scrape();

		expect(mockFetch).toHaveBeenCalledWith(
			`${process.env.NEXT_PUBLIC_API_URL}/api/emergencyRoomData/`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${mockToken}`,
				},
			}
		);
		expect(mockResponse.json).toHaveBeenCalled();
		expect(result).toEqual({});
	});

	it("should throw an error if the user is not signed in", async () => {
		Object.defineProperty(auth, "currentUser", {
			get: jest.fn().mockReturnValue(null),
		});

		const mockResponse = {
			ok: true,
			json: jest.fn().mockResolvedValue({}),
		};
		const mockFetch = jest.fn().mockResolvedValue(mockResponse);
		global.fetch = mockFetch;

		await expect(scrape()).rejects.toThrow(
			"No user is currently signed in."
		);
	});

	it("should throw an error if the scrape info retrieval fails", async () => {
		const mockUserId = "123";
		const mockToken = "mockToken";
		const mockCurrentUser = {
			uid: mockUserId,
			getIdToken: jest.fn().mockResolvedValue(mockToken),
		};

		Object.defineProperty(auth, "currentUser", {
			get: jest.fn().mockReturnValue(mockCurrentUser),
		});

		const mockResponse = {
			status: 500,
			statusText: "Internal Server Error",
		};
		const mockFetch = jest.fn().mockResolvedValue(mockResponse);
		global.fetch = mockFetch;

		await expect(scrape(mockUserId)).rejects.toThrow(
			`Failed to retrieve  emergency situation  HTTP Status: ${mockResponse.status}`
		);
	});
});
