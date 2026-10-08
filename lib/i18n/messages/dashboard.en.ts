import type { Shape } from "../translate";
import type { dashboardSl } from "./dashboard.sl";

export const dashboardEn: Shape<typeof dashboardSl> = {
	title: "Dashboard",
	orders: {
		title: "My orders | Eva-licious",
		heading: "My orders",
		emptyTitle: "No orders yet",
		emptyText: "Once you buy something, it will show up here.",
		goToShop: "Go to the shop →",
		download: "Download",
		goToCourse: "Go to course",
		openCourse: "Open course",
		viewDetails: "View details →",
		backToOrders: "Back to orders",
		detailsHeading: "Order details",
		placedOn: "Placed on {date}",
		total: "Total",
		deliveryEmail: "Delivery email: {email}",
		invoiceNumber: "Invoice number: {number}",
		orderId: "Order ID: {id}",
		types: {
			ebook: "E-book",
			ecourse: "Online course",
			offline_course: "Live course",
		},
		status: {
			completed: "Completed",
			pending: "Processing",
			failed: "Failed",
		},
	},
	settings: {
		title: "Settings | Eva-licious",
		heading: "Settings",
		accountDetails: "Account details",
		name: "Name",
		notSet: "Not set",
		email: "Email",
		notAvailable: "Not available",
	},
};
