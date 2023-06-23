export class MessageType {
  static MessageNone = 0;

  static ConnectionSwitch = 1;

  static ConnectionReject = 2;

  static InitialTraderSettings = 3;

  static DataSubscriptionRequest = 4;

  static ExecutionQuoteInfo = 5;

  static UserConectionRequest = 6;

  static OrderReject = 7;

  static Execution = 8;

  static Order = 9;

  static CancelOrder = 10;

  static ReplaceOrder = 11;

  static InitialData = 12;

  static ConnectionPermit = 13;

  static BatchDataSubscriptionRequest = 14;

  static L1Quotes = 15;

  static MarketPrint = 16;

  static BidAsk = 17;

  static Level2 = 18;

  static Position = 19;

  static ResetExecution = 20;

  static TraderStatus = 21;

  static ChangePasswordRequest = 22;

  static PrintsHistoryRequest = 23;

  static PrintsHistoryResponse = 24;

  static MGRTraderSettings = 25;

  static InitialDataBrackets = 26;

  static HistoryChartRequest = 27;

  static HistoryChartResponse = 28;

  static HeartBeat = 29;

  static UserInfoChange = 30;

  static NYSEImbalanceUpdate = 31;

  static ImbalanceSnapShot = 32;

  static UserDatabaseSync = 33;

  static InitialPOE = 34;

  static NewHighNewLow = 35;

  static NHNLsettings = 36;

  static QuoteSnapRequest = 37;

  static BigSizeSettings = 38;

  static LowRangeSettings = 39;

  static LevelSettings = 40;

  static BigSize = 41;

  static LowRange = 42;

  static Levels = 43;

  static TextMessage = 44;

  static GetDemo = 46;

  static LinkerMessage = 47;

  static UserLogin = 48;

  static DontKnow = 49;

  static RiskStatusChange = 50;

  static ServerLogin = 51;

  static ServerDatabaseSync = 52;

  static ServerParamsChange = 53;

  static SessionState = 54;

  static Level2Update = 55;

  static CreateUserRequest = 56;

  static CreateUserResponse = 57;

  static Level2UpdateCache = 58;

  static ManualTrade = 59;

  static ManualCancelOrder = 60;

  static MarketScheduleResponse = 61;

  static MarketScheduleRequest = 62;

  static CashBalanceUpdate = 63;

  static InfrastructureInfo = 64;

  static ServerInfrastructureInfo = 65;

  static TwitterSubscriptionRequest = 66;

  static TweetAdd = 67;

  static TweetDelete = 68;

  static FilterSubscriprionRequest = 69;

  static FilterResponse = 70;

  static FilterUnsubscriptionRequest = 71;

  static ServerTime = 72;

  static MarketLevel1SnapshotRequest = 73;

  static MarketLevel1SnapshotResponse = 74;

  static TotalPositionOnMarket = 75;

  static CancelChallenge = 76;

  static ChallengeAdded = 77;

  static ChallengeDetails = 79;

  static ChallengeList = 80;

  static ChallengeMembershipChanged = 81;

  static ChallengeRemoved = 82;

  static CreateChallenge = 84;

  static EnterChallengeRequest = 85;

  static LeaveChallenge = 86;

  static UpdateChallenge = 87;

  static StandardRequestResponse = 88;

  static ChallengeBoardUpdate = 89;

  static TradeUpdate = 90;

  static ChallengeBoardSnapshot = 91;

  static TradeSnapshot = 92;

  static PublishChallenge = 93;

  static BalanceUpdate = 94;

  static ClientStatementRequest = 95;

  static ClientStatementResponse = 96;

  static ServerStatementRequest = 97;

  static ServerStatementResponse = 98;

  static ChallengeSettingsChanged = 99;

  static ChallengeInfoChanged = 100;

  static SubscribeForChallengeBoard = 101;

  static UnsubscribeFromChallengeBoard = 102;

  static UpdateUserInfoResponse = 104;

  static BalanceChangeRequest = 105;

  static BalanceChangeResponse = 106;

  static GetQuoteSnapshot = 107;

  static CreateChallengeResponse = 108;

  static EnterChallengeResponse = 109;

  static TicketsCatalogue = 110;

  static UserTicketsList = 111;

  static UserTicketsUpdate = 112;

  static UserTicketsListRequest = 113;

  static UserTicketsListResponse = 114;

  static UserAddTicket = 115;

  static UserSubtractTicket = 116;

  static ChallengeResults = 117;

  static CloseChallengePositions = 118;

  static BlockMarketOnChallengeFinished = 119;

  static UnblockMarketOnChallengeFinished = 120;

  static DeprecateChallenge = 121;

  static BannerListSnapshot = 122;

  static UserProfileUpdateRequest = 123;

  static UserProfileUpdateResponse = 124;

  static UserProfileRequest = 125;

  static UserProfileResponse = 126;

  static UserAchievementsRequest = 127;

  static UserAchievementsResponse = 128;

  static ShtirlitzReportRequest = 129;

  static ShtirlitzReportResponse = 130;

  static ChallengeFinishedMessage = 131;

  static ForceJoinMessage = 132;

  static GiveUpOnChallenge = 133;

  static RejoinChallenge = 134;

  static AllSymbolsRequest = 135;

  static AllSymbolsResponse = 136;

  static AllSymbolsSnapshot = 137;

  static TradingSnapshot = 138;

  static OrderStatusUpdate = 139;

  static BlockIfNoActivityRequest = 140;

  static BlockIfNoActivityResponse = 141;

  static ManualTradeResponse = 142;

  static TokenLogin = 143;

  static TokenValidationRequest = 144;

  static TokenValidationResponse = 145;

  static PrizeFundMessage = 146;

  static PrizeFundSubscriptionRequest = 147;

  static PrizeFundUnsubscriptionRequest = 148;

  static UserDataParametersSubscriptionRequest = 149;

  static UserDataParametersSubscriptionResponse = 150;

  static NativeAccountIdUpdate = 151;

  static NativeAccountIdSnapshot = 152;

  static NativeAccountIdUnsubscriptionRequest = 153;

  static NativeAccountIdSubscriptionRequest = 154;

  static ManagerParametersSubscriptionRequest = 155;

  static ManagerParametersUnsubscriptionRequest = 156;

  static ManagerParametersSnapshot = 157;

  static ManagerParametersUpdate = 158;

  static UsersDatabaseRequest = 159;

  static UsersDatabaseResponse = 160;

  static DataSubscriptionResponse = 161;

  static BatchDataSubscriptionResponse = 162;

  static TradingParametersSubscriptionRequest = 163;

  static TradingParametersSubscriptionResponse = 164;

  static TradingParametersUpdate = 165;

  static UserDataParametersUpdate = 166;

  static UpdateTradingParamsRequest = 167;

  static UpdateDataParamsRequest = 168;

  static UpdateUserInfoRequest = 169;

  static TradingParametersDatabaseRequest = 170;

  static TradingParametersDatabaseResponse = 171;

  static DataParametersDatabaseRequest = 172;

  static DataParametersDatabaseResponse = 173;

  static NativeAccountIdParametersDatabaseRequest = 174;

  static NativeAccountIdParametersDatabaseResponse = 175;

  static DataParametersChange = 176;

  static TradingParametersChange = 177;

  static NativeAccountIdParametersChange = 178;

  static ManagerParametersChange = 179;

  static UserInfoRequest = 180;

  static UserInfoResponse = 181;

  static UpdateDataParamsResponse = 182;

  static UpdateTradingParamsResponse = 183;

  static ChangePasswordResponse = 184;

  static UpdateManagerParametersRequest = 185;

  static UpdateManagerParametersResponse = 186;

  static UserCurrentPassword = 187;

  static UpdateNativeAccountIdParamsRequest = 188;

  static UpdateNativeAccountIdParamsResponse = 189;

  static EasyToBorrowListUpdate = 190;

  static EasyToBorrowListRequest = 191;

  static MetricsMessage = 192;

  static CancellationRejected = 193;

  static PrepareToTradeRequest = 194;

  static PrepareToTradeResponse = 195;

  static BatchPrepareToTradeRequest = 196;

  static BatchPrepareToTradeResponse = 197;

  static UnprepareToTradeRequest = 198;

  static UnprepareToTradeResponse = 199;

  static AuthServerAddressRequest = 200;

  static AuthServerAddressResponse = 201;

  static ReplaceOrderRejected = 202;
}
