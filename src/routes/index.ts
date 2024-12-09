import express from 'express';
import { AuthRoutes } from '../app/modules/auth/auth.route';
import { UserRoutes } from '../app/modules/user/user.route';
import { AdminRoutes } from '../app/modules/admin/admin.routes';
import { BrandRoutes } from '../app/modules/brand/brand.route';
import { InfluencerRoutes } from '../app/modules/influencer/influencer.route';
import { CategoryRoutes } from '../app/modules/category/category.route';
import { CampaignRoutes } from '../app/modules/campaign/campaign.route';
import { DiscountClubRoutes } from '../app/modules/discountClub/discountClub.route';
import { InviteRoutes } from '../app/modules/invite/invite.route';
import { CollaborationRoutes } from '../app/modules/collaboration/collaboration.route';
import { FaqRoutes } from '../app/modules/Faq/Faq.route';
import { ReviewRoutes } from '../app/modules/review/review.route';
import { PermissonRoutes } from '../app/modules/permission_access/permission.route';
import { TermsAndConditionRoutes } from '../app/modules/termsAndCondition/termsAndCondition.route';
import { InterestRoutes } from '../app/modules/interest_influencer/interest.route';
import { SubscriptionRoutes } from '../app/modules/subscribtion/subscribtion.route';
import { PackageRoutes } from '../app/modules/package/package.route';
import { NotificationRoutes } from '../app/modules/notification/notification.route';
import { UpdatedCampaignStatusRoutes } from '../app/modules/permission_access_campaign/permission_access_campaign.route';
import { DashboardRoutes } from '../app/modules/dashboard/dashboard.route';
import { ContactsRoutes } from '../app/modules/contact/contact.route';
import { TrackRoutes } from '../app/modules/track/track.route';
import { ShowInterestRoutes } from '../app/modules/showInterest/showInterest.route';
import { SubmitProveRoutes } from '../app/modules/submitProve/submitProve.route';
import { InterestInFluencerRoutes } from '../app/modules/interest/interest.route';

const router = express.Router();

const apiRoutes = [
  { path: '/user', route: UserRoutes },
  { path: '/auth', route: AuthRoutes },
  { path: '/admin', route: AdminRoutes },
  { path: '/brand', route: BrandRoutes },
  { path: '/influencer', route: InfluencerRoutes },
  { path: '/category', route: CategoryRoutes },
  { path: '/campaign', route: CampaignRoutes },
  { path: '/discount', route: DiscountClubRoutes },
  { path: '/invite', route: InviteRoutes },
  { path: '/collaboration', route: CollaborationRoutes },
  { path: '/faq', route: FaqRoutes },
  { path: '/review', route: ReviewRoutes },
  { path: '/permisson', route: PermissonRoutes },
  { path: '/terms', route: TermsAndConditionRoutes },
  { path: '/subscribtion', route: SubscriptionRoutes },
  { path: '/interest-influencer', route: InterestRoutes },
  { path: '/package', route: PackageRoutes },
  { path: '/notification', route: NotificationRoutes },
  { path: '/updated-campaign-status', route: UpdatedCampaignStatusRoutes },
  { path: '/dashboard', route: DashboardRoutes },
  { path: '/contact', route: ContactsRoutes },
  { path: '/track', route: TrackRoutes },
  { path: '/show-interest', route: ShowInterestRoutes },
  { path: '/submit-prove', route: SubmitProveRoutes },
  { path: '/interest', route: InterestInFluencerRoutes },
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
