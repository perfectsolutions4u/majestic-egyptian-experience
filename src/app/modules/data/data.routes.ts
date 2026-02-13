import { Routes } from '@angular/router';

export const dataRoutes: Routes = [
  {
    path: 'about',
    loadComponent: () => import('../../pages/about/about.component').then((m) => m.AboutComponent),
    title: 'About',
  },
  {
    path: 'best-time-to-visit',
    loadComponent: () => import('../../pages/best-time-to-visit/best-time-to-visit.component').then((m) => m.BestTimeToVisit),
    title: 'Best Time to Visit',
  },
  {
    path: 'destination',
    loadComponent: () =>
      import('../../pages/destination/destination.component').then((m) => m.DestinationComponent),
    title: 'Destination',
  },
  {
    path: 'destination/:slug',
    loadComponent: () =>
      import('../../pages/destination-details/destination-details.component').then(
        (m) => m.DestinationDetailsComponent
      ),
    title: 'Destination Details',
  },
  {
    path: 'tour',
    loadComponent: () => import('../../pages/tour/tour.component').then((m) => m.TourComponent),
    title: 'Tour',
  },
  {
    path: 'tour/:slug',
    loadComponent: () =>
      import('../../pages/tour-details/tour-details.component').then((m) => m.TourDetailsComponent),
    title: 'Tour Details',
  },
  {
    path: 'blog',
    loadComponent: () => import('../../pages/blog/blog.component').then((m) => m.BlogComponent),
    title: 'Blog',
  },
  {
    path: 'blog/:slug',
    loadComponent: () =>
      import('../../pages/blog-details/blog-details.component').then((m) => m.BlogDetailsComponent),
    title: 'Blog Details',
  },
  {
    path: 'blog-category/:id',
    loadComponent: () =>
      import('../../pages/blog-category/blog-category.component').then((m) => m.BlogCategory),
    title: 'Blog Category',
  },
  {
    path: 'category/:slug',
    loadComponent: () => import('../../pages/category/category.component').then((m) => m.Category),
    title: 'Category',
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('../../pages/contact/contact.component').then((m) => m.ContactComponent),
    title: 'Contact',
  },
  {
    path: 'faq',
    loadComponent: () => import('../../pages/faq/faq.component').then((m) => m.FaqComponent),
    title: 'FAQ',
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('../../pages/profile/profile.component').then((m) => m.ProfileComponent),
    title: 'Profile',
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('../../pages/checkout/checkout.component').then((m) => m.CheckoutComponent),
    title: 'Checkout',
  },
  {
    path: 'cart',
    loadComponent: () => import('../../pages/cart/cart.component').then((m) => m.CartComponent),
    title: 'Cart',
  },
  {
    path: 'makeTrip',
    loadComponent: () =>
      import('../../pages/make-trip/make-trip.component').then((m) => m.MakeTripComponent),
    title: 'Make Trip',
  },
];
