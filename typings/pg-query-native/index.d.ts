declare module "pg-query-native" {
  interface PgNode {}

  /*
   * This enum represents the different strengths of FOR UPDATE/SHARE clauses.
   * The ordering here is important, because the highest numerical value takes
   * precedence when a RTE is specified multiple ways.  See applyLockingClause.
   */
  const enum PgLockClauseStrength {
      LCS_NONE = 0,
      LCS_FORKEYSHARE = 1,
      LCS_FORSHARE = 2,
      LCS_FORNOKEYUPDATE = 3,
      LCS_FORUPDATE = 4
  }
  /*
   * This enum controls how to deal with rows being locked by FOR UPDATE/SHARE
   * clauses (i.e., it represents the NOWAIT and SKIP LOCKED options).
   * The ordering here is important, because the highest numerical value takes
   * precedence when a RTE is specified multiple ways.  See applyLockingClause.
   */
  const enum PgLockWaitPolicy {
      LockWaitBlock = 0,
      LockWaitSkip = 1,
      LockWaitError = 2
  }
  /*
   * The first field of every node is NodeTag. Each node created (with makeNode)
   * will have one of the following tags as the value of its first field.
   *
   * Note that the numbers of the node tags are not contiguous. We left holes
   * here so that we can add more tags without changing the existing enum's.
   * (Since node tag numbers never exist outside backend memory, there's no
   * real harm in renumbering, it just costs a full rebuild ...)
   */
  const enum PgNodeTag {
      T_Invalid = 0,
      T_IndexInfo = 1,
      T_ExprContext = 2,
      T_ProjectionInfo = 3,
      T_JunkFilter = 4,
      T_ResultRelInfo = 5,
      T_EState = 6,
      T_TupleTableSlot = 7,
      T_Plan = 8,
      T_Result = 9,
      T_ModifyTable = 10,
      T_Append = 11,
      T_MergeAppend = 12,
      T_RecursiveUnion = 13,
      T_BitmapAnd = 14,
      T_BitmapOr = 15,
      T_Scan = 16,
      T_SeqScan = 17,
      T_SampleScan = 18,
      T_IndexScan = 19,
      T_IndexOnlyScan = 20,
      T_BitmapIndexScan = 21,
      T_BitmapHeapScan = 22,
      T_TidScan = 23,
      T_SubqueryScan = 24,
      T_FunctionScan = 25,
      T_ValuesScan = 26,
      T_CteScan = 27,
      T_WorkTableScan = 28,
      T_ForeignScan = 29,
      T_CustomScan = 30,
      T_Join = 31,
      T_NestLoop = 32,
      T_MergeJoin = 33,
      T_HashJoin = 34,
      T_Material = 35,
      T_Sort = 36,
      T_Group = 37,
      T_Agg = 38,
      T_WindowAgg = 39,
      T_Unique = 40,
      T_Hash = 41,
      T_SetOp = 42,
      T_LockRows = 43,
      T_Limit = 44,
      T_NestLoopParam = 45,
      T_PlanRowMark = 46,
      T_PlanInvalItem = 47,
      T_PlanState = 48,
      T_ResultState = 49,
      T_ModifyTableState = 50,
      T_AppendState = 51,
      T_MergeAppendState = 52,
      T_RecursiveUnionState = 53,
      T_BitmapAndState = 54,
      T_BitmapOrState = 55,
      T_ScanState = 56,
      T_SeqScanState = 57,
      T_SampleScanState = 58,
      T_IndexScanState = 59,
      T_IndexOnlyScanState = 60,
      T_BitmapIndexScanState = 61,
      T_BitmapHeapScanState = 62,
      T_TidScanState = 63,
      T_SubqueryScanState = 64,
      T_FunctionScanState = 65,
      T_ValuesScanState = 66,
      T_CteScanState = 67,
      T_WorkTableScanState = 68,
      T_ForeignScanState = 69,
      T_CustomScanState = 70,
      T_JoinState = 71,
      T_NestLoopState = 72,
      T_MergeJoinState = 73,
      T_HashJoinState = 74,
      T_MaterialState = 75,
      T_SortState = 76,
      T_GroupState = 77,
      T_AggState = 78,
      T_WindowAggState = 79,
      T_UniqueState = 80,
      T_HashState = 81,
      T_SetOpState = 82,
      T_LockRowsState = 83,
      T_LimitState = 84,
      T_Alias = 85,
      T_RangeVar = 86,
      T_Expr = 87,
      T_Var = 88,
      T_Const = 89,
      T_Param = 90,
      T_Aggref = 91,
      T_GroupingFunc = 92,
      T_WindowFunc = 93,
      T_ArrayRef = 94,
      T_FuncExpr = 95,
      T_NamedArgExpr = 96,
      T_OpExpr = 97,
      T_DistinctExpr = 98,
      T_NullIfExpr = 99,
      T_ScalarArrayOpExpr = 100,
      T_BoolExpr = 101,
      T_SubLink = 102,
      T_SubPlan = 103,
      T_AlternativeSubPlan = 104,
      T_FieldSelect = 105,
      T_FieldStore = 106,
      T_RelabelType = 107,
      T_CoerceViaIO = 108,
      T_ArrayCoerceExpr = 109,
      T_ConvertRowtypeExpr = 110,
      T_CollateExpr = 111,
      T_CaseExpr = 112,
      T_CaseWhen = 113,
      T_CaseTestExpr = 114,
      T_ArrayExpr = 115,
      T_RowExpr = 116,
      T_RowCompareExpr = 117,
      T_CoalesceExpr = 118,
      T_MinMaxExpr = 119,
      T_XmlExpr = 120,
      T_NullTest = 121,
      T_BooleanTest = 122,
      T_CoerceToDomain = 123,
      T_CoerceToDomainValue = 124,
      T_SetToDefault = 125,
      T_CurrentOfExpr = 126,
      T_InferenceElem = 127,
      T_TargetEntry = 128,
      T_RangeTblRef = 129,
      T_JoinExpr = 130,
      T_FromExpr = 131,
      T_OnConflictExpr = 132,
      T_IntoClause = 133,
      T_ExprState = 134,
      T_GenericExprState = 135,
      T_WholeRowVarExprState = 136,
      T_AggrefExprState = 137,
      T_GroupingFuncExprState = 138,
      T_WindowFuncExprState = 139,
      T_ArrayRefExprState = 140,
      T_FuncExprState = 141,
      T_ScalarArrayOpExprState = 142,
      T_BoolExprState = 143,
      T_SubPlanState = 144,
      T_AlternativeSubPlanState = 145,
      T_FieldSelectState = 146,
      T_FieldStoreState = 147,
      T_CoerceViaIOState = 148,
      T_ArrayCoerceExprState = 149,
      T_ConvertRowtypeExprState = 150,
      T_CaseExprState = 151,
      T_CaseWhenState = 152,
      T_ArrayExprState = 153,
      T_RowExprState = 154,
      T_RowCompareExprState = 155,
      T_CoalesceExprState = 156,
      T_MinMaxExprState = 157,
      T_XmlExprState = 158,
      T_NullTestState = 159,
      T_CoerceToDomainState = 160,
      T_DomainConstraintState = 161,
      T_PlannerInfo = 162,
      T_PlannerGlobal = 163,
      T_RelOptInfo = 164,
      T_IndexOptInfo = 165,
      T_ParamPathInfo = 166,
      T_Path = 167,
      T_IndexPath = 168,
      T_BitmapHeapPath = 169,
      T_BitmapAndPath = 170,
      T_BitmapOrPath = 171,
      T_NestPath = 172,
      T_MergePath = 173,
      T_HashPath = 174,
      T_TidPath = 175,
      T_ForeignPath = 176,
      T_CustomPath = 177,
      T_AppendPath = 178,
      T_MergeAppendPath = 179,
      T_ResultPath = 180,
      T_MaterialPath = 181,
      T_UniquePath = 182,
      T_EquivalenceClass = 183,
      T_EquivalenceMember = 184,
      T_PathKey = 185,
      T_RestrictInfo = 186,
      T_PlaceHolderVar = 187,
      T_SpecialJoinInfo = 188,
      T_AppendRelInfo = 189,
      T_PlaceHolderInfo = 190,
      T_MinMaxAggInfo = 191,
      T_PlannerParamItem = 192,
      T_MemoryContext = 193,
      T_AllocSetContext = 194,
      T_Value = 195,
      T_Integer = 196,
      T_Float = 197,
      T_String = 198,
      T_BitString = 199,
      T_Null = 200,
      T_List = 201,
      T_IntList = 202,
      T_OidList = 203,
      T_Query = 204,
      T_PlannedStmt = 205,
      T_InsertStmt = 206,
      T_DeleteStmt = 207,
      T_UpdateStmt = 208,
      T_SelectStmt = 209,
      T_AlterTableStmt = 210,
      T_AlterTableCmd = 211,
      T_AlterDomainStmt = 212,
      T_SetOperationStmt = 213,
      T_GrantStmt = 214,
      T_GrantRoleStmt = 215,
      T_AlterDefaultPrivilegesStmt = 216,
      T_ClosePortalStmt = 217,
      T_ClusterStmt = 218,
      T_CopyStmt = 219,
      T_CreateStmt = 220,
      T_DefineStmt = 221,
      T_DropStmt = 222,
      T_TruncateStmt = 223,
      T_CommentStmt = 224,
      T_FetchStmt = 225,
      T_IndexStmt = 226,
      T_CreateFunctionStmt = 227,
      T_AlterFunctionStmt = 228,
      T_DoStmt = 229,
      T_RenameStmt = 230,
      T_RuleStmt = 231,
      T_NotifyStmt = 232,
      T_ListenStmt = 233,
      T_UnlistenStmt = 234,
      T_TransactionStmt = 235,
      T_ViewStmt = 236,
      T_LoadStmt = 237,
      T_CreateDomainStmt = 238,
      T_CreatedbStmt = 239,
      T_DropdbStmt = 240,
      T_VacuumStmt = 241,
      T_ExplainStmt = 242,
      T_CreateTableAsStmt = 243,
      T_CreateSeqStmt = 244,
      T_AlterSeqStmt = 245,
      T_VariableSetStmt = 246,
      T_VariableShowStmt = 247,
      T_DiscardStmt = 248,
      T_CreateTrigStmt = 249,
      T_CreatePLangStmt = 250,
      T_CreateRoleStmt = 251,
      T_AlterRoleStmt = 252,
      T_DropRoleStmt = 253,
      T_LockStmt = 254,
      T_ConstraintsSetStmt = 255,
      T_ReindexStmt = 256,
      T_CheckPointStmt = 257,
      T_CreateSchemaStmt = 258,
      T_AlterDatabaseStmt = 259,
      T_AlterDatabaseSetStmt = 260,
      T_AlterRoleSetStmt = 261,
      T_CreateConversionStmt = 262,
      T_CreateCastStmt = 263,
      T_CreateOpClassStmt = 264,
      T_CreateOpFamilyStmt = 265,
      T_AlterOpFamilyStmt = 266,
      T_PrepareStmt = 267,
      T_ExecuteStmt = 268,
      T_DeallocateStmt = 269,
      T_DeclareCursorStmt = 270,
      T_CreateTableSpaceStmt = 271,
      T_DropTableSpaceStmt = 272,
      T_AlterObjectSchemaStmt = 273,
      T_AlterOwnerStmt = 274,
      T_DropOwnedStmt = 275,
      T_ReassignOwnedStmt = 276,
      T_CompositeTypeStmt = 277,
      T_CreateEnumStmt = 278,
      T_CreateRangeStmt = 279,
      T_AlterEnumStmt = 280,
      T_AlterTSDictionaryStmt = 281,
      T_AlterTSConfigurationStmt = 282,
      T_CreateFdwStmt = 283,
      T_AlterFdwStmt = 284,
      T_CreateForeignServerStmt = 285,
      T_AlterForeignServerStmt = 286,
      T_CreateUserMappingStmt = 287,
      T_AlterUserMappingStmt = 288,
      T_DropUserMappingStmt = 289,
      T_AlterTableSpaceOptionsStmt = 290,
      T_AlterTableMoveAllStmt = 291,
      T_SecLabelStmt = 292,
      T_CreateForeignTableStmt = 293,
      T_ImportForeignSchemaStmt = 294,
      T_CreateExtensionStmt = 295,
      T_AlterExtensionStmt = 296,
      T_AlterExtensionContentsStmt = 297,
      T_CreateEventTrigStmt = 298,
      T_AlterEventTrigStmt = 299,
      T_RefreshMatViewStmt = 300,
      T_ReplicaIdentityStmt = 301,
      T_AlterSystemStmt = 302,
      T_CreatePolicyStmt = 303,
      T_AlterPolicyStmt = 304,
      T_CreateTransformStmt = 305,
      T_A_Expr = 306,
      T_ColumnRef = 307,
      T_ParamRef = 308,
      T_A_Const = 309,
      T_FuncCall = 310,
      T_A_Star = 311,
      T_A_Indices = 312,
      T_A_Indirection = 313,
      T_A_ArrayExpr = 314,
      T_ResTarget = 315,
      T_MultiAssignRef = 316,
      T_TypeCast = 317,
      T_CollateClause = 318,
      T_SortBy = 319,
      T_WindowDef = 320,
      T_RangeSubselect = 321,
      T_RangeFunction = 322,
      T_RangeTableSample = 323,
      T_TypeName = 324,
      T_ColumnDef = 325,
      T_IndexElem = 326,
      T_Constraint = 327,
      T_DefElem = 328,
      T_RangeTblEntry = 329,
      T_RangeTblFunction = 330,
      T_TableSampleClause = 331,
      T_WithCheckOption = 332,
      T_SortGroupClause = 333,
      T_GroupingSet = 334,
      T_WindowClause = 335,
      T_FuncWithArgs = 336,
      T_AccessPriv = 337,
      T_CreateOpClassItem = 338,
      T_TableLikeClause = 339,
      T_FunctionParameter = 340,
      T_LockingClause = 341,
      T_RowMarkClause = 342,
      T_XmlSerialize = 343,
      T_WithClause = 344,
      T_InferClause = 345,
      T_OnConflictClause = 346,
      T_CommonTableExpr = 347,
      T_RoleSpec = 348,
      T_IdentifySystemCmd = 349,
      T_BaseBackupCmd = 350,
      T_CreateReplicationSlotCmd = 351,
      T_DropReplicationSlotCmd = 352,
      T_StartReplicationCmd = 353,
      T_TimeLineHistoryCmd = 354,
      T_TriggerData = 355,
      T_EventTriggerData = 356,
      T_ReturnSetInfo = 357,
      T_WindowObjectData = 358,
      T_TIDBitmap = 359,
      T_InlineCodeBlock = 360,
      T_FdwRoutine = 361,
      T_TsmRoutine = 362
  }
  /*
   * CmdType -
   *	  enums for type of operation represented by a Query or PlannedStmt
   *
   * This is needed in both parsenodes.h and plannodes.h, so put it here...
   */
  const enum PgCmdType {
      CMD_UNKNOWN = 0,
      CMD_SELECT = 1,
      CMD_UPDATE = 2,
      CMD_INSERT = 3,
      CMD_DELETE = 4,
      CMD_UTILITY = 5,
      CMD_NOTHING = 6
  }
  /*
   * JoinType -
   *	  enums for types of relation joins
   *
   * JoinType determines the exact semantics of joining two relations using
   * a matching qualification.  For example, it tells what to do with a tuple
   * that has no match in the other relation.
   *
   * This is needed in both parsenodes.h and plannodes.h, so put it here...
   */
  const enum PgJoinType {
      JOIN_INNER = 0,
      JOIN_LEFT = 1,
      JOIN_FULL = 2,
      JOIN_RIGHT = 3,
      JOIN_SEMI = 4,
      JOIN_ANTI = 5,
      JOIN_UNIQUE_OUTER = 6,
      JOIN_UNIQUE_INNER = 7
  }
  /*
   * OnConflictAction -
   *	  "ON CONFLICT" clause type of query
   *
   * This is needed in both parsenodes.h and plannodes.h, so put it here...
   */
  const enum PgOnConflictAction {
      ONCONFLICT_NONE = 0,
      ONCONFLICT_NOTHING = 1,
      ONCONFLICT_UPDATE = 2
  }
  /**/
  const enum PgInhOption {
      INH_NO = 0,
      INH_YES = 1,
      INH_DEFAULT = 2
  }
  /* What to do at commit time for temporary relations */
  const enum PgOnCommitAction {
      ONCOMMIT_NOOP = 0,
      ONCOMMIT_PRESERVE_ROWS = 1,
      ONCOMMIT_DELETE_ROWS = 2,
      ONCOMMIT_DROP = 3
  }
  /*
   * Param
   *
   *		paramkind specifies the kind of parameter. The possible values
   *		for this field are:
   *
   *		PARAM_EXTERN:  The parameter value is supplied from outside the plan.
   *				Such parameters are numbered from 1 to n.
   *
   *		PARAM_EXEC:  The parameter is an internal executor parameter, used
   *				for passing values into and out of sub-queries or from
   *				nestloop joins to their inner scans.
   *				For historical reasons, such parameters are numbered from 0.
   *				These numbers are independent of PARAM_EXTERN numbers.
   *
   *		PARAM_SUBLINK:	The parameter represents an output column of a SubLink
   *				node's sub-select.  The column number is contained in the
   *				`paramid' field.  (This type of Param is converted to
   *				PARAM_EXEC during planning.)
   *
   *		PARAM_MULTIEXPR:  Like PARAM_SUBLINK, the parameter represents an
   *				output column of a SubLink node's sub-select, but here, the
   *				SubLink is always a MULTIEXPR SubLink.  The high-order 16 bits
   *				of the `paramid' field contain the SubLink's subLinkId, and
   *				the low-order 16 bits contain the column number.  (This type
   *				of Param is also converted to PARAM_EXEC during planning.)
   */
  const enum PgParamKind {
      PARAM_EXTERN = 0,
      PARAM_EXEC = 1,
      PARAM_SUBLINK = 2,
      PARAM_MULTIEXPR = 3
  }
  /*
   * CoercionContext - distinguishes the allowed set of type casts
   *
   * NB: ordering of the alternatives is significant; later (larger) values
   * allow more casts than earlier ones.
   */
  const enum PgCoercionContext {
      COERCION_IMPLICIT = 0,
      COERCION_ASSIGNMENT = 1,
      COERCION_EXPLICIT = 2
  }
  /*
   * CoercionForm - how to display a node that could have come from a cast
   *
   * NB: equal() ignores CoercionForm fields, therefore this *must* not carry
   * any semantically significant information.  We need that behavior so that
   * the planner will consider equivalent implicit and explicit casts to be
   * equivalent.  In cases where those actually behave differently, the coercion
   * function's arguments will be different.
   */
  const enum PgCoercionForm {
      COERCE_EXPLICIT_CALL = 0,
      COERCE_EXPLICIT_CAST = 1,
      COERCE_IMPLICIT_CAST = 2
  }
  /*
   * BoolExpr - expression node for the basic Boolean operators AND, OR, NOT
   *
   * Notice the arguments are given as a List.  For NOT, of course the list
   * must always have exactly one element.  For AND and OR, there can be two
   * or more arguments.
   */
  const enum PgBoolExprType {
      AND_EXPR = 0,
      OR_EXPR = 1
  }
  /*
   * SubLink
   *
   * A SubLink represents a subselect appearing in an expression, and in some
   * cases also the combining operator(s) just above it.  The subLinkType
   * indicates the form of the expression represented:
   *	EXISTS_SUBLINK		EXISTS(SELECT ...)
   *	ALL_SUBLINK			(lefthand) op ALL (SELECT ...)
   *	ANY_SUBLINK			(lefthand) op ANY (SELECT ...)
   *	ROWCOMPARE_SUBLINK	(lefthand) op (SELECT ...)
   *	EXPR_SUBLINK		(SELECT with single targetlist item ...)
   *	MULTIEXPR_SUBLINK	(SELECT with multiple targetlist items ...)
   *	ARRAY_SUBLINK		ARRAY(SELECT with single targetlist item ...)
   *	CTE_SUBLINK			WITH query (never actually part of an expression)
   * For ALL, ANY, and ROWCOMPARE, the lefthand is a list of expressions of the
   * same length as the subselect's targetlist.  ROWCOMPARE will *always* have
   * a list with more than one entry; if the subselect has just one target
   * then the parser will create an EXPR_SUBLINK instead (and any operator
   * above the subselect will be represented separately).
   * ROWCOMPARE, EXPR, and MULTIEXPR require the subselect to deliver at most
   * one row (if it returns no rows, the result is NULL).
   * ALL, ANY, and ROWCOMPARE require the combining operators to deliver boolean
   * results.  ALL and ANY combine the per-row results using AND and OR
   * semantics respectively.
   * ARRAY requires just one target column, and creates an array of the target
   * column's type using any number of rows resulting from the subselect.
   *
   * SubLink is classed as an Expr node, but it is not actually executable;
   * it must be replaced in the expression tree by a SubPlan node during
   * planning.
   *
   * NOTE: in the raw output of gram.y, testexpr contains just the raw form
   * of the lefthand expression (if any), and operName is the String name of
   * the combining operator.  Also, subselect is a raw parsetree.  During parse
   * analysis, the parser transforms testexpr into a complete boolean expression
   * that compares the lefthand value(s) to PARAM_SUBLINK nodes representing the
   * output columns of the subselect.  And subselect is transformed to a Query.
   * This is the representation seen in saved rules and in the rewriter.
   *
   * In EXISTS, EXPR, MULTIEXPR, and ARRAY SubLinks, testexpr and operName
   * are unused and are always null.
   *
   * subLinkId is currently used only for MULTIEXPR SubLinks, and is zero in
   * other SubLinks.  This number identifies different multiple-assignment
   * subqueries within an UPDATE statement's SET list.  It is unique only
   * within a particular targetlist.  The output column(s) of the MULTIEXPR
   * are referenced by PARAM_MULTIEXPR Params appearing elsewhere in the tlist.
   *
   * The CTE_SUBLINK case never occurs in actual SubLink nodes, but it is used
   * in SubPlans generated for WITH subqueries.
   */
  const enum PgSubLinkType {
      EXISTS_SUBLINK = 0,
      ALL_SUBLINK = 1,
      ANY_SUBLINK = 2,
      ROWCOMPARE_SUBLINK = 3,
      EXPR_SUBLINK = 4,
      MULTIEXPR_SUBLINK = 5,
      ARRAY_SUBLINK = 6,
      CTE_SUBLINK = 7
  }
  /*
   * RowCompareExpr - row-wise comparison, such as (a, b) <= (1, 2)
   *
   * We support row comparison for any operator that can be determined to
   * act like =, <>, <, <=, >, or >= (we determine this by looking for the
   * operator in btree opfamilies).  Note that the same operator name might
   * map to a different operator for each pair of row elements, since the
   * element datatypes can vary.
   *
   * A RowCompareExpr node is only generated for the < <= > >= cases;
   * the = and <> cases are translated to simple AND or OR combinations
   * of the pairwise comparisons.  However, we include = and <> in the
   * RowCompareType enum for the convenience of parser logic.
   */
  const enum PgRowCompareType {
      ROWCOMPARE_LT = 0,
      ROWCOMPARE_LE = 1,
      ROWCOMPARE_EQ = 2,
      ROWCOMPARE_GE = 3,
      ROWCOMPARE_GT = 4,
      ROWCOMPARE_NE = 5
  }
  /*
   * MinMaxExpr - a GREATEST or LEAST function
   */
  const enum PgMinMaxOp {
      IS_GREATEST = 0,
      IS_LEAST = 1
  }
  /*
   * XmlExpr - various SQL/XML functions requiring special grammar productions
   *
   * 'name' carries the "NAME foo" argument (already XML-escaped).
   * 'named_args' and 'arg_names' represent an xml_attribute list.
   * 'args' carries all other arguments.
   *
   * Note: result type/typmod/collation are not stored, but can be deduced
   * from the XmlExprOp.  The type/typmod fields are just used for display
   * purposes, and are NOT necessarily the true result type of the node.
   */
  const enum PgXmlExprOp {
      IS_XMLCONCAT = 0,
      IS_XMLELEMENT = 1,
      IS_XMLFOREST = 2,
      IS_XMLPARSE = 3,
      IS_XMLPI = 4,
      IS_XMLROOT = 5,
      IS_XMLSERIALIZE = 6,
      IS_DOCUMENT = 7
  }
  /**/
  const enum PgXmlOptionType {
      XMLOPTION_DOCUMENT = 0,
      XMLOPTION_CONTENT = 1
  }
  /* ----------------
   * NullTest
   *
   * NullTest represents the operation of testing a value for NULLness.
   * The appropriate test is performed and returned as a boolean Datum.
   *
   * NOTE: the semantics of this for rowtype inputs are noticeably different
   * from the scalar case.  We provide an "argisrow" flag to reflect that.
   * ----------------
   */
  const enum PgNullTestType {
      IS_NULL = 0,
      IS_NOT_NULL = 1
  }
  /*
   * BooleanTest
   *
   * BooleanTest represents the operation of determining whether a boolean
   * is TRUE, FALSE, or UNKNOWN (ie, NULL).  All six meaningful combinations
   * are supported.  Note that a NULL input does *not* cause a NULL result.
   * The appropriate test is performed and returned as a boolean Datum.
   */
  const enum PgBoolTestType {
      IS_TRUE = 0,
      IS_NOT_TRUE = 1
  }
  /* Possible sources of a Query */
  const enum PgQuerySource {
      QSRC_ORIGINAL = 0,
      QSRC_PARSER = 1,
      QSRC_INSTEAD_RULE = 2,
      QSRC_QUAL_INSTEAD_RULE = 3,
      QSRC_NON_INSTEAD_RULE = 4
  }
  /* Sort ordering options for ORDER BY and CREATE INDEX */
  const enum PgSortByDir {
      SORTBY_DEFAULT = 0,
      SORTBY_ASC = 1,
      SORTBY_DESC = 2,
      SORTBY_USING = 3
  }
  /**/
  const enum PgSortByNulls {
      SORTBY_NULLS_DEFAULT = 0,
      SORTBY_NULLS_FIRST = 1,
      SORTBY_NULLS_LAST = 2
  }
  /*
   * A_Expr - infix, prefix, and postfix expressions
   */
  const enum PgA_Expr_Kind {
      AEXPR_OP = 0,
      AEXPR_OP_ANY = 1,
      AEXPR_OP_ALL = 2,
      AEXPR_DISTINCT = 3,
      AEXPR_NULLIF = 4,
      AEXPR_OF = 5,
      AEXPR_IN = 6,
      AEXPR_LIKE = 7,
      AEXPR_ILIKE = 8,
      AEXPR_SIMILAR = 9,
      AEXPR_BETWEEN = 10,
      AEXPR_NOT_BETWEEN = 11,
      AEXPR_BETWEEN_SYM = 12,
      AEXPR_NOT_BETWEEN_SYM = 13,
      AEXPR_PAREN = 14
  }
  /*
   * RoleSpec - a role name or one of a few special values.
   */
  const enum PgRoleSpecType {
      ROLESPEC_CSTRING = 0,
      ROLESPEC_CURRENT_USER = 1,
      ROLESPEC_SESSION_USER = 2,
      ROLESPEC_PUBLIC = 3
  }
  /**/
  const enum PgTableLikeOption {
      CREATE_TABLE_LIKE_DEFAULTS = 0,
      CREATE_TABLE_LIKE_CONSTRAINTS = 1,
      CREATE_TABLE_LIKE_INDEXES = 2,
      CREATE_TABLE_LIKE_STORAGE = 3,
      CREATE_TABLE_LIKE_COMMENTS = 4,
      CREATE_TABLE_LIKE_ALL = 5
  }
  /*
   * DefElem - a generic "name = value" option definition
   *
   * In some contexts the name can be qualified.  Also, certain SQL commands
   * allow a SET/ADD/DROP action to be attached to option settings, so it's
   * convenient to carry a field for that too.  (Note: currently, it is our
   * practice that the grammar allows namespace and action only in statements
   * where they are relevant; C code can just ignore those fields in other
   * statements.)
   */
  const enum PgDefElemAction {
      DEFELEM_UNSPEC = 0,
      DEFELEM_SET = 1,
      DEFELEM_ADD = 2,
      DEFELEM_DROP = 3
  }
  /*--------------------
   * RangeTblEntry -
   *	  A range table is a List of RangeTblEntry nodes.
   *
   *	  A range table entry may represent a plain relation, a sub-select in
   *	  FROM, or the result of a JOIN clause.  (Only explicit JOIN syntax
   *	  produces an RTE, not the implicit join resulting from multiple FROM
   *	  items.  This is because we only need the RTE to deal with SQL features
   *	  like outer joins and join-output-column aliasing.)  Other special
   *	  RTE types also exist, as indicated by RTEKind.
   *
   *	  Note that we consider RTE_RELATION to cover anything that has a pg_class
   *	  entry.  relkind distinguishes the sub-cases.
   *
   *	  alias is an Alias node representing the AS alias-clause attached to the
   *	  FROM expression, or NULL if no clause.
   *
   *	  eref is the table reference name and column reference names (either
   *	  real or aliases).  Note that system columns (OID etc) are not included
   *	  in the column list.
   *	  eref->aliasname is required to be present, and should generally be used
   *	  to identify the RTE for error messages etc.
   *
   *	  In RELATION RTEs, the colnames in both alias and eref are indexed by
   *	  physical attribute number; this means there must be colname entries for
   *	  dropped columns.  When building an RTE we insert empty strings ("") for
   *	  dropped columns.  Note however that a stored rule may have nonempty
   *	  colnames for columns dropped since the rule was created (and for that
   *	  matter the colnames might be out of date due to column renamings).
   *	  The same comments apply to FUNCTION RTEs when a function's return type
   *	  is a named composite type.
   *
   *	  In JOIN RTEs, the colnames in both alias and eref are one-to-one with
   *	  joinaliasvars entries.  A JOIN RTE will omit columns of its inputs when
   *	  those columns are known to be dropped at parse time.  Again, however,
   *	  a stored rule might contain entries for columns dropped since the rule
   *	  was created.  (This is only possible for columns not actually referenced
   *	  in the rule.)  When loading a stored rule, we replace the joinaliasvars
   *	  items for any such columns with null pointers.  (We can't simply delete
   *	  them from the joinaliasvars list, because that would affect the attnums
   *	  of Vars referencing the rest of the list.)
   *
   *	  inh is TRUE for relation references that should be expanded to include
   *	  inheritance children, if the rel has any.  This *must* be FALSE for
   *	  RTEs other than RTE_RELATION entries.
   *
   *	  inFromCl marks those range variables that are listed in the FROM clause.
   *	  It's false for RTEs that are added to a query behind the scenes, such
   *	  as the NEW and OLD variables for a rule, or the subqueries of a UNION.
   *	  This flag is not used anymore during parsing, since the parser now uses
   *	  a separate "namespace" data structure to control visibility, but it is
   *	  needed by ruleutils.c to determine whether RTEs should be shown in
   *	  decompiled queries.
   *
   *	  requiredPerms and checkAsUser specify run-time access permissions
   *	  checks to be performed at query startup.  The user must have *all*
   *	  of the permissions that are OR'd together in requiredPerms (zero
   *	  indicates no permissions checking).  If checkAsUser is not zero,
   *	  then do the permissions checks using the access rights of that user,
   *	  not the current effective user ID.  (This allows rules to act as
   *	  setuid gateways.)  Permissions checks only apply to RELATION RTEs.
   *
   *	  For SELECT/INSERT/UPDATE permissions, if the user doesn't have
   *	  table-wide permissions then it is sufficient to have the permissions
   *	  on all columns identified in selectedCols (for SELECT) and/or
   *	  insertedCols and/or updatedCols (INSERT with ON CONFLICT DO UPDATE may
   *	  have all 3).  selectedCols, insertedCols and updatedCols are bitmapsets,
   *	  which cannot have negative integer members, so we subtract
   *	  FirstLowInvalidHeapAttributeNumber from column numbers before storing
   *	  them in these fields.  A whole-row Var reference is represented by
   *	  setting the bit for InvalidAttrNumber.
   *--------------------
   */
  const enum PgRTEKind {
      RTE_RELATION = 0,
      RTE_SUBQUERY = 1,
      RTE_JOIN = 2,
      RTE_FUNCTION = 3,
      RTE_VALUES = 4,
      RTE_CTE = 5
  }
  /*
   * WithCheckOption -
   *		representation of WITH CHECK OPTION checks to be applied to new tuples
   *		when inserting/updating an auto-updatable view, or RLS WITH CHECK
   *		policies to be applied when inserting/updating a relation with RLS.
   */
  const enum PgWCOKind {
      WCO_VIEW_CHECK = 0,
      WCO_RLS_INSERT_CHECK = 1,
      WCO_RLS_UPDATE_CHECK = 2,
      WCO_RLS_CONFLICT_CHECK = 3
  }
  /*
   * GroupingSet -
   *		representation of CUBE, ROLLUP and GROUPING SETS clauses
   *
   * In a Query with grouping sets, the groupClause contains a flat list of
   * SortGroupClause nodes for each distinct expression used.  The actual
   * structure of the GROUP BY clause is given by the groupingSets tree.
   *
   * In the raw parser output, GroupingSet nodes (of all types except SIMPLE
   * which is not used) are potentially mixed in with the expressions in the
   * groupClause of the SelectStmt.  (An expression can't contain a GroupingSet,
   * but a list may mix GroupingSet and expression nodes.)  At this stage, the
   * content of each node is a list of expressions, some of which may be RowExprs
   * which represent sublists rather than actual row constructors, and nested
   * GroupingSet nodes where legal in the grammar.  The structure directly
   * reflects the query syntax.
   *
   * In parse analysis, the transformed expressions are used to build the tlist
   * and groupClause list (of SortGroupClause nodes), and the groupingSets tree
   * is eventually reduced to a fixed format:
   *
   * EMPTY nodes represent (), and obviously have no content
   *
   * SIMPLE nodes represent a list of one or more expressions to be treated as an
   * atom by the enclosing structure; the content is an integer list of
   * ressortgroupref values (see SortGroupClause)
   *
   * CUBE and ROLLUP nodes contain a list of one or more SIMPLE nodes.
   *
   * SETS nodes contain a list of EMPTY, SIMPLE, CUBE or ROLLUP nodes, but after
   * parse analysis they cannot contain more SETS nodes; enough of the syntactic
   * transforms of the spec have been applied that we no longer have arbitrarily
   * deep nesting (though we still preserve the use of cube/rollup).
   *
   * Note that if the groupingSets tree contains no SIMPLE nodes (only EMPTY
   * nodes at the leaves), then the groupClause will be empty, but this is still
   * an aggregation query (similar to using aggs or HAVING without GROUP BY).
   *
   * As an example, the following clause:
   *
   * GROUP BY GROUPING SETS ((a,b), CUBE(c,(d,e)))
   *
   * looks like this after raw parsing:
   *
   * SETS( RowExpr(a,b) , CUBE( c, RowExpr(d,e) ) )
   *
   * and parse analysis converts it to:
   *
   * SETS( SIMPLE(1,2), CUBE( SIMPLE(3), SIMPLE(4,5) ) )
   */
  const enum PgGroupingSetKind {
      GROUPING_SET_EMPTY = 0,
      GROUPING_SET_SIMPLE = 1,
      GROUPING_SET_ROLLUP = 2,
      GROUPING_SET_CUBE = 3,
      GROUPING_SET_SETS = 4
  }
  /* ----------------------
   *		Select Statement
   *
   * A "simple" SELECT is represented in the output of gram.y by a single
   * SelectStmt node; so is a VALUES construct.  A query containing set
   * operators (UNION, INTERSECT, EXCEPT) is represented by a tree of SelectStmt
   * nodes, in which the leaf nodes are component SELECTs and the internal nodes
   * represent UNION, INTERSECT, or EXCEPT operators.  Using the same node
   * type for both leaf and internal nodes allows gram.y to stick ORDER BY,
   * LIMIT, etc, clause values into a SELECT statement without worrying
   * whether it is a simple or compound SELECT.
   * ----------------------
   */
  const enum PgSetOperation {
      SETOP_NONE = 0,
      SETOP_UNION = 1,
      SETOP_INTERSECT = 2,
      SETOP_EXCEPT = 3
  }
  /*
   * When a command can act on several kinds of objects with only one
   * parse structure required, use these constants to designate the
   * object type.  Note that commands typically don't support all the types.
   */
  const enum PgObjectType {
      OBJECT_AGGREGATE = 0,
      OBJECT_AMOP = 1,
      OBJECT_AMPROC = 2,
      OBJECT_ATTRIBUTE = 3,
      OBJECT_CAST = 4,
      OBJECT_COLUMN = 5,
      OBJECT_COLLATION = 6,
      OBJECT_CONVERSION = 7,
      OBJECT_DATABASE = 8,
      OBJECT_DEFAULT = 9,
      OBJECT_DEFACL = 10,
      OBJECT_DOMAIN = 11,
      OBJECT_DOMCONSTRAINT = 12,
      OBJECT_EVENT_TRIGGER = 13,
      OBJECT_EXTENSION = 14,
      OBJECT_FDW = 15,
      OBJECT_FOREIGN_SERVER = 16,
      OBJECT_FOREIGN_TABLE = 17,
      OBJECT_FUNCTION = 18,
      OBJECT_INDEX = 19,
      OBJECT_LANGUAGE = 20,
      OBJECT_LARGEOBJECT = 21,
      OBJECT_MATVIEW = 22,
      OBJECT_OPCLASS = 23,
      OBJECT_OPERATOR = 24,
      OBJECT_OPFAMILY = 25,
      OBJECT_POLICY = 26,
      OBJECT_ROLE = 27,
      OBJECT_RULE = 28,
      OBJECT_SCHEMA = 29,
      OBJECT_SEQUENCE = 30,
      OBJECT_TABCONSTRAINT = 31,
      OBJECT_TABLE = 32,
      OBJECT_TABLESPACE = 33,
      OBJECT_TRANSFORM = 34,
      OBJECT_TRIGGER = 35,
      OBJECT_TSCONFIGURATION = 36,
      OBJECT_TSDICTIONARY = 37,
      OBJECT_TSPARSER = 38,
      OBJECT_TSTEMPLATE = 39,
      OBJECT_TYPE = 40,
      OBJECT_USER_MAPPING = 41,
      OBJECT_VIEW = 42
  }
  /**/
  const enum PgDropBehavior {
      DROP_RESTRICT = 0,
      DROP_CASCADE = 1
  }
  /**/
  const enum PgAlterTableType {
      AT_AddColumn = 0,
      AT_AddColumnRecurse = 1,
      AT_AddColumnToView = 2,
      AT_ColumnDefault = 3,
      AT_DropNotNull = 4,
      AT_SetNotNull = 5,
      AT_SetStatistics = 6,
      AT_SetOptions = 7,
      AT_ResetOptions = 8,
      AT_SetStorage = 9,
      AT_DropColumn = 10,
      AT_DropColumnRecurse = 11,
      AT_AddIndex = 12,
      AT_ReAddIndex = 13,
      AT_AddConstraint = 14,
      AT_AddConstraintRecurse = 15,
      AT_ReAddConstraint = 16,
      AT_AlterConstraint = 17,
      AT_ValidateConstraint = 18,
      AT_ValidateConstraintRecurse = 19,
      AT_ProcessedConstraint = 20,
      AT_AddIndexConstraint = 21,
      AT_DropConstraint = 22,
      AT_DropConstraintRecurse = 23,
      AT_ReAddComment = 24,
      AT_AlterColumnType = 25,
      AT_AlterColumnGenericOptions = 26,
      AT_ChangeOwner = 27,
      AT_ClusterOn = 28,
      AT_DropCluster = 29,
      AT_SetLogged = 30,
      AT_SetUnLogged = 31,
      AT_AddOids = 32,
      AT_AddOidsRecurse = 33,
      AT_DropOids = 34,
      AT_SetTableSpace = 35,
      AT_SetRelOptions = 36,
      AT_ResetRelOptions = 37,
      AT_ReplaceRelOptions = 38,
      AT_EnableTrig = 39,
      AT_EnableAlwaysTrig = 40,
      AT_EnableReplicaTrig = 41,
      AT_DisableTrig = 42,
      AT_EnableTrigAll = 43,
      AT_DisableTrigAll = 44,
      AT_EnableTrigUser = 45,
      AT_DisableTrigUser = 46,
      AT_EnableRule = 47,
      AT_EnableAlwaysRule = 48,
      AT_EnableReplicaRule = 49,
      AT_DisableRule = 50,
      AT_AddInherit = 51,
      AT_DropInherit = 52,
      AT_AddOf = 53,
      AT_DropOf = 54,
      AT_ReplicaIdentity = 55,
      AT_EnableRowSecurity = 56,
      AT_DisableRowSecurity = 57,
      AT_ForceRowSecurity = 58,
      AT_NoForceRowSecurity = 59,
      AT_GenericOptions = 60
  }
  /* ----------------------
   *		Grant|Revoke Statement
   * ----------------------
   */
  const enum PgGrantTargetType {
      ACL_TARGET_OBJECT = 0,
      ACL_TARGET_ALL_IN_SCHEMA = 1,
      ACL_TARGET_DEFAULTS = 2
  }
  /**/
  const enum PgGrantObjectType {
      ACL_OBJECT_COLUMN = 0,
      ACL_OBJECT_RELATION = 1,
      ACL_OBJECT_SEQUENCE = 2,
      ACL_OBJECT_DATABASE = 3,
      ACL_OBJECT_DOMAIN = 4,
      ACL_OBJECT_FDW = 5,
      ACL_OBJECT_FOREIGN_SERVER = 6,
      ACL_OBJECT_FUNCTION = 7,
      ACL_OBJECT_LANGUAGE = 8,
      ACL_OBJECT_LARGEOBJECT = 9,
      ACL_OBJECT_NAMESPACE = 10,
      ACL_OBJECT_TABLESPACE = 11,
      ACL_OBJECT_TYPE = 12
  }
  /* ----------------------
   * SET Statement (includes RESET)
   *
   * "SET var TO DEFAULT" and "RESET var" are semantically equivalent, but we
   * preserve the distinction in VariableSetKind for CreateCommandTag().
   * ----------------------
   */
  const enum PgVariableSetKind {
      VAR_SET_VALUE = 0,
      VAR_SET_DEFAULT = 1,
      VAR_SET_CURRENT = 2,
      VAR_SET_MULTI = 3,
      VAR_RESET = 4,
      VAR_RESET_ALL = 5
  }
  /* ----------
   * Definitions for constraints in CreateStmt
   *
   * Note that column defaults are treated as a type of constraint,
   * even though that's a bit odd semantically.
   *
   * For constraints that use expressions (CONSTR_CHECK, CONSTR_DEFAULT)
   * we may have the expression in either "raw" form (an untransformed
   * parse tree) or "cooked" form (the nodeToString representation of
   * an executable expression tree), depending on how this Constraint
   * node was created (by parsing, or by inheritance from an existing
   * relation).  We should never have both in the same node!
   *
   * FKCONSTR_ACTION_xxx values are stored into pg_constraint.confupdtype
   * and pg_constraint.confdeltype columns; FKCONSTR_MATCH_xxx values are
   * stored into pg_constraint.confmatchtype.  Changing the code values may
   * require an initdb!
   *
   * If skip_validation is true then we skip checking that the existing rows
   * in the table satisfy the constraint, and just install the catalog entries
   * for the constraint.  A new FK constraint is marked as valid iff
   * initially_valid is true.  (Usually skip_validation and initially_valid
   * are inverses, but we can set both true if the table is known empty.)
   *
   * Constraint attributes (DEFERRABLE etc) are initially represented as
   * separate Constraint nodes for simplicity of parsing.  parse_utilcmd.c makes
   * a pass through the constraints list to insert the info into the appropriate
   * Constraint node.
   * ----------
   */
  const enum PgConstrType {
      CONSTR_NULL = 0,
      CONSTR_NOTNULL = 1,
      CONSTR_DEFAULT = 2,
      CONSTR_CHECK = 3,
      CONSTR_PRIMARY = 4,
      CONSTR_UNIQUE = 5,
      CONSTR_EXCLUSION = 6,
      CONSTR_FOREIGN = 7,
      CONSTR_ATTR_DEFERRABLE = 8,
      CONSTR_ATTR_NOT_DEFERRABLE = 9,
      CONSTR_ATTR_DEFERRED = 10,
      CONSTR_ATTR_IMMEDIATE = 11
  }
  /* ----------------------
   *		Import Foreign Schema Statement
   * ----------------------
   */
  const enum PgImportForeignSchemaType {
      FDW_IMPORT_SCHEMA_ALL = 0,
      FDW_IMPORT_SCHEMA_LIMIT_TO = 1,
      FDW_IMPORT_SCHEMA_EXCEPT = 2
  }
  /* ----------------------
   *	Create/Alter/Drop Role Statements
   *
   * Note: these node types are also used for the backwards-compatible
   * Create/Alter/Drop User/Group statements.  In the ALTER and DROP cases
   * there's really no need to distinguish what the original spelling was,
   * but for CREATE we mark the type because the defaults vary.
   * ----------------------
   */
  const enum PgRoleStmtType {
      ROLESTMT_ROLE = 0,
      ROLESTMT_USER = 1,
      ROLESTMT_GROUP = 2
  }
  /* ----------------------
   *		Fetch Statement (also Move)
   * ----------------------
   */
  const enum PgFetchDirection {
      FETCH_FORWARD = 0,
      FETCH_BACKWARD = 1,
      FETCH_ABSOLUTE = 2,
      FETCH_RELATIVE = 3
  }
  /**/
  const enum PgFunctionParameterMode {
      FUNC_PARAM_IN = 0,
      FUNC_PARAM_OUT = 1,
      FUNC_PARAM_INOUT = 2,
      FUNC_PARAM_VARIADIC = 3,
      FUNC_PARAM_TABLE = 4
  }
  /* ----------------------
   *		{Begin|Commit|Rollback} Transaction Statement
   * ----------------------
   */
  const enum PgTransactionStmtKind {
      TRANS_STMT_BEGIN = 0,
      TRANS_STMT_START = 1,
      TRANS_STMT_COMMIT = 2,
      TRANS_STMT_ROLLBACK = 3,
      TRANS_STMT_SAVEPOINT = 4,
      TRANS_STMT_RELEASE = 5,
      TRANS_STMT_ROLLBACK_TO = 6,
      TRANS_STMT_PREPARE = 7,
      TRANS_STMT_COMMIT_PREPARED = 8,
      TRANS_STMT_ROLLBACK_PREPARED = 9
  }
  /* ----------------------
   *		Create View Statement
   * ----------------------
   */
  const enum PgViewCheckOption {
      NO_CHECK_OPTION = 0,
      LOCAL_CHECK_OPTION = 1,
      CASCADED_CHECK_OPTION = 2
  }
  /* ----------------------
   *		Vacuum and Analyze Statements
   *
   * Even though these are nominally two statements, it's convenient to use
   * just one node type for both.  Note that at least one of VACOPT_VACUUM
   * and VACOPT_ANALYZE must be set in options.
   * ----------------------
   */
  const enum PgVacuumOption {
      VACOPT_VACUUM = 0,
      VACOPT_ANALYZE = 1,
      VACOPT_VERBOSE = 2,
      VACOPT_FREEZE = 3,
      VACOPT_FULL = 4,
      VACOPT_NOWAIT = 5,
      VACOPT_SKIPTOAST = 6
  }
  /* ----------------------
   * Discard Statement
   * ----------------------
   */
  const enum PgDiscardMode {
      DISCARD_ALL = 0,
      DISCARD_PLANS = 1,
      DISCARD_SEQUENCES = 2,
      DISCARD_TEMP = 3
  }
  /* Reindex options */
  const enum PgReindexObjectType {
      REINDEX_OBJECT_INDEX = 0,
      REINDEX_OBJECT_TABLE = 1,
      REINDEX_OBJECT_SCHEMA = 2,
      REINDEX_OBJECT_SYSTEM = 3,
      REINDEX_OBJECT_DATABASE = 4
  }
  /*
   * TS Configuration stmts: DefineStmt, RenameStmt and DropStmt are default
   */
  const enum PgAlterTSConfigType {
      ALTER_TSCONFIG_ADD_MAPPING = 0,
      ALTER_TSCONFIG_ALTER_MAPPING_FOR_TOKEN = 1,
      ALTER_TSCONFIG_REPLACE_DICT = 2,
      ALTER_TSCONFIG_REPLACE_DICT_FOR_TOKEN = 3,
      ALTER_TSCONFIG_DROP_MAPPING = 4
  }

  /**/
  interface PgInteger extends PgNode {
    Integer: {
      /**/
      ival: number;
    }
  }
  /**/
  interface PgFloat extends PgNode {
    Float: {
      /**/
      str?: string;
    }
  }
  /**/
  interface PgString extends PgNode {
    String: {
      /**/
      str?: string;
    }
  }
  /**/
  interface PgBitString extends PgNode {
    BitString: {
      /**/
      str?: string;
    }
  }
  /**/
  interface PgNull extends PgNode {
    Null: {

    }
  }
  /*
   * Alias -
   *	  specifies an alias for a range variable; the alias might also
   *	  specify renaming of columns within the table.
   *
   * Note: colnames is a list of Value nodes (always strings).  In Alias structs
   * associated with RTEs, there may be entries corresponding to dropped
   * columns; these are normally empty strings ("").  See parsenodes.h for info.
   */
  interface PgAlias extends PgNode {
    Alias: {
      /* aliased rel name (never qualified) */
      aliasname?: string;
      /* optional list of column aliases */
      colnames?: PgNode[];
    }
  }
  /*
   * RangeVar - range variable, used in FROM clauses
   *
   * Also used to represent table names in utility statements; there, the alias
   * field is not used, and inhOpt shows whether to apply the operation
   * recursively to child tables.  In some contexts it is also useful to carry
   * a TEMP table indication here.
   */
  interface PgRangeVar extends PgNode {
    RangeVar: {
      /* the catalog (database) name, or NULL */
      catalogname?: string;
      /* the schema name, or NULL */
      schemaname?: string;
      /* the relation/sequence name */
      relname?: string;
      /* expand rel by inheritance? recursively act
      								 * on children? */

      inhOpt: PgInhOption;
      /* see RELPERSISTENCE_* in pg_class.h */
      relpersistence: string;
      /* table alias & optional column aliases */
      alias?: PgAlias;
      /* token location, or -1 if unknown */
      location: number;
    }
  }
  /*
   * IntoClause - target information for SELECT INTO, CREATE TABLE AS, and
   * CREATE MATERIALIZED VIEW
   *
   * For CREATE MATERIALIZED VIEW, viewQuery is the parsed-but-not-rewritten
   * SELECT Query for the view; otherwise it's NULL.  (Although it's actually
   * Query*, we declare it as Node* to avoid a forward reference.)
   */
  interface PgIntoClause extends PgNode {
    IntoClause: {
      /* target relation name */
      rel?: PgRangeVar;
      /* column names to assign, or NIL */
      colNames?: PgNode[];
      /* options from WITH clause */
      options?: PgNode[];
      /* what do we do at COMMIT? */
      onCommit: PgOnCommitAction;
      /* table space to use, or NULL */
      tableSpaceName?: string;
      /* materialized view's SELECT query */
      viewQuery?: PgNode;
      /* true for WITH NO DATA */
      skipData: boolean;
    }
  }
  /*
   * Expr - generic superclass for executable-expression nodes
   *
   * All node types that are used in executable expression trees should derive
   * from Expr (that is, have Expr as their first field).  Since Expr only
   * contains NodeTag, this is a formality, but it is an easy form of
   * documentation.  See also the ExprState node types in execnodes.h.
   */
  interface PgExpr extends PgNode {
    Expr: {

    }
  }
  /* Symbols for the indexes of the special RTE entries in rules */
  interface PgVar extends PgNode {
    Var: {
      /**/
      xpr: PgExpr;
      /* index of this var's relation in the range
      								 * table, or INNER_VAR/OUTER_VAR/INDEX_VAR */

      varno: number;
      /* attribute number of this var, or zero for
      								 * all */

      varattno: number;
      /* pg_type OID for the type of this var */
      vartype: number;
      /* pg_attribute typmod value */
      vartypmod: number;
      /* OID of collation, or InvalidOid if none */
      varcollid: number;
      /* for subquery variables referencing outer
      								 * relations; 0 in a normal var, >0 means N
      								 * levels up */

      varlevelsup: number;
      /* original value of varno, for debugging */
      varnoold: number;
      /* original value of varattno */
      varoattno: number;
      /* token location, or -1 if unknown */
      location: number;
    }
  }
  /*
   * Const
   *
   * Note: for varlena data types, we make a rule that a Const node's value
   * must be in non-extended form (4-byte header, no compression or external
   * references).  This ensures that the Const node is self-contained and makes
   * it more likely that equal() will see logically identical values as equal.
   */
  interface PgConst extends PgNode {
    Const: {
      /**/
      xpr: PgExpr;
      /* pg_type OID of the constant's datatype */
      consttype: number;
      /* typmod value, if any */
      consttypmod: number;
      /* OID of collation, or InvalidOid if none */
      constcollid: number;
      /* typlen of the constant's datatype */
      constlen: number;
      /* the constant's value */
      constvalue: any;
      /* whether the constant is null (if true,
      								 * constvalue is undefined) */

      constisnull: boolean;
      /* whether this datatype is passed by value.
      								 * If true, then all the information is stored
      								 * in the Datum. If false, then the Datum
      								 * contains a pointer to the information. */

      constbyval: boolean;
      /* token location, or -1 if unknown */
      location: number;
    }
  }
  /*
   * Param
   *
   *		paramkind specifies the kind of parameter. The possible values
   *		for this field are:
   *
   *		PARAM_EXTERN:  The parameter value is supplied from outside the plan.
   *				Such parameters are numbered from 1 to n.
   *
   *		PARAM_EXEC:  The parameter is an internal executor parameter, used
   *				for passing values into and out of sub-queries or from
   *				nestloop joins to their inner scans.
   *				For historical reasons, such parameters are numbered from 0.
   *				These numbers are independent of PARAM_EXTERN numbers.
   *
   *		PARAM_SUBLINK:	The parameter represents an output column of a SubLink
   *				node's sub-select.  The column number is contained in the
   *				`paramid' field.  (This type of Param is converted to
   *				PARAM_EXEC during planning.)
   *
   *		PARAM_MULTIEXPR:  Like PARAM_SUBLINK, the parameter represents an
   *				output column of a SubLink node's sub-select, but here, the
   *				SubLink is always a MULTIEXPR SubLink.  The high-order 16 bits
   *				of the `paramid' field contain the SubLink's subLinkId, and
   *				the low-order 16 bits contain the column number.  (This type
   *				of Param is also converted to PARAM_EXEC during planning.)
   */
  interface PgParam extends PgNode {
    Param: {
      /**/
      xpr: PgExpr;
      /* kind of parameter. See above */
      paramkind: PgParamKind;
      /* numeric ID for parameter */
      paramid: number;
      /* pg_type OID of parameter's datatype */
      paramtype: number;
      /* typmod value, if known */
      paramtypmod: number;
      /* OID of collation, or InvalidOid if none */
      paramcollid: number;
      /* token location, or -1 if unknown */
      location: number;
    }
  }
  /*
   * Aggref
   *
   * The aggregate's args list is a targetlist, ie, a list of TargetEntry nodes.
   *
   * For a normal (non-ordered-set) aggregate, the non-resjunk TargetEntries
   * represent the aggregate's regular arguments (if any) and resjunk TLEs can
   * be added at the end to represent ORDER BY expressions that are not also
   * arguments.  As in a top-level Query, the TLEs can be marked with
   * ressortgroupref indexes to let them be referenced by SortGroupClause
   * entries in the aggorder and/or aggdistinct lists.  This represents ORDER BY
   * and DISTINCT operations to be applied to the aggregate input rows before
   * they are passed to the transition function.  The grammar only allows a
   * simple "DISTINCT" specifier for the arguments, but we use the full
   * query-level representation to allow more code sharing.
   *
   * For an ordered-set aggregate, the args list represents the WITHIN GROUP
   * (aggregated) arguments, all of which will be listed in the aggorder list.
   * DISTINCT is not supported in this case, so aggdistinct will be NIL.
   * The direct arguments appear in aggdirectargs (as a list of plain
   * expressions, not TargetEntry nodes).
   */
  interface PgAggref extends PgNode {
    Aggref: {
      /**/
      xpr: PgExpr;
      /* pg_proc Oid of the aggregate */
      aggfnoid: number;
      /* type Oid of result of the aggregate */
      aggtype: number;
      /* OID of collation of result */
      aggcollid: number;
      /* OID of collation that function should use */
      inputcollid: number;
      /* direct arguments, if an ordered-set agg */
      aggdirectargs?: PgNode[];
      /* aggregated arguments and sort expressions */
      args?: PgNode[];
      /* ORDER BY (list of SortGroupClause) */
      aggorder?: PgNode[];
      /* DISTINCT (list of SortGroupClause) */
      aggdistinct?: PgNode[];
      /* FILTER expression, if any */
      aggfilter?: PgExpr;
      /* TRUE if argument list was really '*' */
      aggstar: boolean;
      /* true if variadic arguments have been
      								 * combined into an array last argument */

      aggvariadic: boolean;
      /* aggregate kind (see pg_aggregate.h) */
      aggkind: string;
      /* > 0 if agg belongs to outer query */
      agglevelsup: number;
      /* token location, or -1 if unknown */
      location: number;
    }
  }
  /*
   * GroupingFunc
   *
   * A GroupingFunc is a GROUPING(...) expression, which behaves in many ways
   * like an aggregate function (e.g. it "belongs" to a specific query level,
   * which might not be the one immediately containing it), but also differs in
   * an important respect: it never evaluates its arguments, they merely
   * designate expressions from the GROUP BY clause of the query level to which
   * it belongs.
   *
   * The spec defines the evaluation of GROUPING() purely by syntactic
   * replacement, but we make it a real expression for optimization purposes so
   * that one Agg node can handle multiple grouping sets at once.  Evaluating the
   * result only needs the column positions to check against the grouping set
   * being projected.  However, for EXPLAIN to produce meaningful output, we have
   * to keep the original expressions around, since expression deparse does not
   * give us any feasible way to get at the GROUP BY clause.
   *
   * Also, we treat two GroupingFunc nodes as equal if they have equal arguments
   * lists and agglevelsup, without comparing the refs and cols annotations.
   *
   * In raw parse output we have only the args list; parse analysis fills in the
   * refs list, and the planner fills in the cols list.
   */
  interface PgGroupingFunc extends PgNode {
    GroupingFunc: {
      /**/
      xpr: PgExpr;
      /* arguments, not evaluated but kept for
      								 * benefit of EXPLAIN etc. */

      args?: PgNode[];
      /* ressortgrouprefs of arguments */
      refs?: PgNode[];
      /* actual column positions set by planner */
      cols?: PgNode[];
      /* same as Aggref.agglevelsup */
      agglevelsup: number;
      /* token location */
      location: number;
    }
  }
  /*
   * WindowFunc
   */
  interface PgWindowFunc extends PgNode {
    WindowFunc: {
      /**/
      xpr: PgExpr;
      /* pg_proc Oid of the function */
      winfnoid: number;
      /* type Oid of result of the window function */
      wintype: number;
      /* OID of collation of result */
      wincollid: number;
      /* OID of collation that function should use */
      inputcollid: number;
      /* arguments to the window function */
      args?: PgNode[];
      /* FILTER expression, if any */
      aggfilter?: PgExpr;
      /* index of associated WindowClause */
      winref: number;
      /* TRUE if argument list was really '*' */
      winstar: boolean;
      /* is function a simple aggregate? */
      winagg: boolean;
      /* token location, or -1 if unknown */
      location: number;
    }
  }
  /* ----------------
   *	ArrayRef: describes an array subscripting operation
   *
   * An ArrayRef can describe fetching a single element from an array,
   * fetching a subarray (array slice), storing a single element into
   * an array, or storing a slice.  The "store" cases work with an
   * initial array value and a source value that is inserted into the
   * appropriate part of the array; the result of the operation is an
   * entire new modified array value.
   *
   * If reflowerindexpr = NIL, then we are fetching or storing a single array
   * element at the subscripts given by refupperindexpr.  Otherwise we are
   * fetching or storing an array slice, that is a rectangular subarray
   * with lower and upper bounds given by the index expressions.
   * reflowerindexpr must be the same length as refupperindexpr when it
   * is not NIL.
   *
   * Note: the result datatype is the element type when fetching a single
   * element; but it is the array type when doing subarray fetch or either
   * type of store.
   *
   * Note: for the cases where an array is returned, if refexpr yields a R/W
   * expanded array, then the implementation is allowed to modify that object
   * in-place and return the same object.)
   * ----------------
   */
  interface PgArrayRef extends PgNode {
    ArrayRef: {
      /**/
      xpr: PgExpr;
      /* type of the array proper */
      refarraytype: number;
      /* type of the array elements */
      refelemtype: number;
      /* typmod of the array (and elements too) */
      reftypmod: number;
      /* OID of collation, or InvalidOid if none */
      refcollid: number;
      /* expressions that evaluate to upper array
      								 * indexes */

      refupperindexpr?: PgNode[];
      /* expressions that evaluate to lower array
      								 * indexes */

      reflowerindexpr?: PgNode[];
      /* the expression that evaluates to an array
      								 * value */

      refexpr?: PgExpr;
      /* expression for the source value, or NULL if
      								 * fetch */

      refassgnexpr?: PgExpr;
    }
  }
  /*
   * FuncExpr - expression node for a function call
   */
  interface PgFuncExpr extends PgNode {
    FuncExpr: {
      /**/
      xpr: PgExpr;
      /* PG_PROC OID of the function */
      funcid: number;
      /* PG_TYPE OID of result value */
      funcresulttype: number;
      /* true if function returns set */
      funcretset: boolean;
      /* true if variadic arguments have been
      								 * combined into an array last argument */

      funcvariadic: boolean;
      /* how to display this function call */
      funcformat: PgCoercionForm;
      /* OID of collation of result */
      funccollid: number;
      /* OID of collation that function should use */
      inputcollid: number;
      /* arguments to the function */
      args?: PgNode[];
      /* token location, or -1 if unknown */
      location: number;
    }
  }
  /*
   * NamedArgExpr - a named argument of a function
   *
   * This node type can only appear in the args list of a FuncCall or FuncExpr
   * node.  We support pure positional call notation (no named arguments),
   * named notation (all arguments are named), and mixed notation (unnamed
   * arguments followed by named ones).
   *
   * Parse analysis sets argnumber to the positional index of the argument,
   * but doesn't rearrange the argument list.
   *
   * The planner will convert argument lists to pure positional notation
   * during expression preprocessing, so execution never sees a NamedArgExpr.
   */
  interface PgNamedArgExpr extends PgNode {
    NamedArgExpr: {
      /**/
      xpr: PgExpr;
      /* the argument expression */
      arg?: PgExpr;
      /* the name */
      name?: string;
      /* argument's number in positional notation */
      argnumber: number;
      /* argument name location, or -1 if unknown */
      location: number;
    }
  }
  /*
   * OpExpr - expression node for an operator invocation
   *
   * Semantically, this is essentially the same as a function call.
   *
   * Note that opfuncid is not necessarily filled in immediately on creation
   * of the node.  The planner makes sure it is valid before passing the node
   * tree to the executor, but during parsing/planning opfuncid can be 0.
   */
  interface PgOpExpr extends PgNode {
    OpExpr: {
      /**/
      xpr: PgExpr;
      /* PG_OPERATOR OID of the operator */
      opno: number;
      /* PG_PROC OID of underlying function */
      opfuncid: number;
      /* PG_TYPE OID of result value */
      opresulttype: number;
      /* true if operator returns set */
      opretset: boolean;
      /* OID of collation of result */
      opcollid: number;
      /* OID of collation that operator should use */
      inputcollid: number;
      /* arguments to the operator (1 or 2) */
      args?: PgNode[];
      /* token location, or -1 if unknown */
      location: number;
    }
  }
  /*
   * ScalarArrayOpExpr - expression node for "scalar op ANY/ALL (array)"
   *
   * The operator must yield boolean.  It is applied to the left operand
   * and each element of the righthand array, and the results are combined
   * with OR or AND (for ANY or ALL respectively).  The node representation
   * is almost the same as for the underlying operator, but we need a useOr
   * flag to remember whether it's ANY or ALL, and we don't have to store
   * the result type (or the collation) because it must be boolean.
   */
  interface PgScalarArrayOpExpr extends PgNode {
    ScalarArrayOpExpr: {
      /**/
      xpr: PgExpr;
      /* PG_OPERATOR OID of the operator */
      opno: number;
      /* PG_PROC OID of underlying function */
      opfuncid: number;
      /* true for ANY, false for ALL */
      useOr: boolean;
      /* OID of collation that operator should use */
      inputcollid: number;
      /* the scalar and array operands */
      args?: PgNode[];
      /* token location, or -1 if unknown */
      location: number;
    }
  }
  /**/
  interface PgBoolExpr extends PgNode {
    BoolExpr: {
      /**/
      xpr: PgExpr;
      /**/
      boolop: PgBoolExprType;
      /* arguments to this expression */
      args?: PgNode[];
      /* token location, or -1 if unknown */
      location: number;
    }
  }
  /*
   * SubLink
   *
   * A SubLink represents a subselect appearing in an expression, and in some
   * cases also the combining operator(s) just above it.  The subLinkType
   * indicates the form of the expression represented:
   *	EXISTS_SUBLINK		EXISTS(SELECT ...)
   *	ALL_SUBLINK			(lefthand) op ALL (SELECT ...)
   *	ANY_SUBLINK			(lefthand) op ANY (SELECT ...)
   *	ROWCOMPARE_SUBLINK	(lefthand) op (SELECT ...)
   *	EXPR_SUBLINK		(SELECT with single targetlist item ...)
   *	MULTIEXPR_SUBLINK	(SELECT with multiple targetlist items ...)
   *	ARRAY_SUBLINK		ARRAY(SELECT with single targetlist item ...)
   *	CTE_SUBLINK			WITH query (never actually part of an expression)
   * For ALL, ANY, and ROWCOMPARE, the lefthand is a list of expressions of the
   * same length as the subselect's targetlist.  ROWCOMPARE will *always* have
   * a list with more than one entry; if the subselect has just one target
   * then the parser will create an EXPR_SUBLINK instead (and any operator
   * above the subselect will be represented separately).
   * ROWCOMPARE, EXPR, and MULTIEXPR require the subselect to deliver at most
   * one row (if it returns no rows, the result is NULL).
   * ALL, ANY, and ROWCOMPARE require the combining operators to deliver boolean
   * results.  ALL and ANY combine the per-row results using AND and OR
   * semantics respectively.
   * ARRAY requires just one target column, and creates an array of the target
   * column's type using any number of rows resulting from the subselect.
   *
   * SubLink is classed as an Expr node, but it is not actually executable;
   * it must be replaced in the expression tree by a SubPlan node during
   * planning.
   *
   * NOTE: in the raw output of gram.y, testexpr contains just the raw form
   * of the lefthand expression (if any), and operName is the String name of
   * the combining operator.  Also, subselect is a raw parsetree.  During parse
   * analysis, the parser transforms testexpr into a complete boolean expression
   * that compares the lefthand value(s) to PARAM_SUBLINK nodes representing the
   * output columns of the subselect.  And subselect is transformed to a Query.
   * This is the representation seen in saved rules and in the rewriter.
   *
   * In EXISTS, EXPR, MULTIEXPR, and ARRAY SubLinks, testexpr and operName
   * are unused and are always null.
   *
   * subLinkId is currently used only for MULTIEXPR SubLinks, and is zero in
   * other SubLinks.  This number identifies different multiple-assignment
   * subqueries within an UPDATE statement's SET list.  It is unique only
   * within a particular targetlist.  The output column(s) of the MULTIEXPR
   * are referenced by PARAM_MULTIEXPR Params appearing elsewhere in the tlist.
   *
   * The CTE_SUBLINK case never occurs in actual SubLink nodes, but it is used
   * in SubPlans generated for WITH subqueries.
   */
  interface PgSubLink extends PgNode {
    SubLink: {
      /**/
      xpr: PgExpr;
      /* see above */
      subLinkType: PgSubLinkType;
      /* ID (1..n); 0 if not MULTIEXPR */
      subLinkId: number;
      /* outer-query test for ALL/ANY/ROWCOMPARE */
      testexpr?: PgNode;
      /* originally specified operator name */
      operName?: PgNode[];
      /* subselect as Query* or raw parsetree */
      subselect?: PgNode;
      /* token location, or -1 if unknown */
      location: number;
    }
  }
  /*
   * SubPlan - executable expression node for a subplan (sub-SELECT)
   *
   * The planner replaces SubLink nodes in expression trees with SubPlan
   * nodes after it has finished planning the subquery.  SubPlan references
   * a sub-plantree stored in the subplans list of the toplevel PlannedStmt.
   * (We avoid a direct link to make it easier to copy expression trees
   * without causing multiple processing of the subplan.)
   *
   * In an ordinary subplan, testexpr points to an executable expression
   * (OpExpr, an AND/OR tree of OpExprs, or RowCompareExpr) for the combining
   * operator(s); the left-hand arguments are the original lefthand expressions,
   * and the right-hand arguments are PARAM_EXEC Param nodes representing the
   * outputs of the sub-select.  (NOTE: runtime coercion functions may be
   * inserted as well.)  This is just the same expression tree as testexpr in
   * the original SubLink node, but the PARAM_SUBLINK nodes are replaced by
   * suitably numbered PARAM_EXEC nodes.
   *
   * If the sub-select becomes an initplan rather than a subplan, the executable
   * expression is part of the outer plan's expression tree (and the SubPlan
   * node itself is not, but rather is found in the outer plan's initPlan
   * list).  In this case testexpr is NULL to avoid duplication.
   *
   * The planner also derives lists of the values that need to be passed into
   * and out of the subplan.  Input values are represented as a list "args" of
   * expressions to be evaluated in the outer-query context (currently these
   * args are always just Vars, but in principle they could be any expression).
   * The values are assigned to the global PARAM_EXEC params indexed by parParam
   * (the parParam and args lists must have the same ordering).  setParam is a
   * list of the PARAM_EXEC params that are computed by the sub-select, if it
   * is an initplan; they are listed in order by sub-select output column
   * position.  (parParam and setParam are integer Lists, not Bitmapsets,
   * because their ordering is significant.)
   *
   * Also, the planner computes startup and per-call costs for use of the
   * SubPlan.  Note that these include the cost of the subquery proper,
   * evaluation of the testexpr if any, and any hashtable management overhead.
   */
  interface PgSubPlan extends PgNode {
    SubPlan: {
      /**/
      xpr: PgExpr;
      /* see above */
      subLinkType: PgSubLinkType;
      /* OpExpr or RowCompareExpr expression tree */
      testexpr?: PgNode;
      /* IDs of Params embedded in the above */
      paramIds?: PgNode[];
      /* Index (from 1) in PlannedStmt.subplans */
      plan_id: number;
      /* A name assigned during planning */
      plan_name?: string;
      /* Type of first column of subplan result */
      firstColType: number;
      /* Typmod of first column of subplan result */
      firstColTypmod: number;
      /* Collation of first column of
      										 * subplan result */

      firstColCollation: number;
      /* TRUE to store subselect output in a hash
      								 * table (implies we are doing "IN") */

      useHashTable: boolean;
      /* TRUE if it's okay to return FALSE when the
      								 * spec result is UNKNOWN; this allows much
      								 * simpler handling of null values */

      unknownEqFalse: boolean;
      /* initplan subqueries have to set these
      								 * Params for parent plan */

      setParam?: PgNode[];
      /* indices of input Params from parent plan */
      parParam?: PgNode[];
      /* exprs to pass as parParam values */
      args?: PgNode[];
      /* one-time setup cost */
      startup_cost: any;
      /* cost for each subplan evaluation */
      per_call_cost: any;
    }
  }
  /*
   * AlternativeSubPlan - expression node for a choice among SubPlans
   *
   * The subplans are given as a List so that the node definition need not
   * change if there's ever more than two alternatives.  For the moment,
   * though, there are always exactly two; and the first one is the fast-start
   * plan.
   */
  interface PgAlternativeSubPlan extends PgNode {
    AlternativeSubPlan: {
      /**/
      xpr: PgExpr;
      /* SubPlan(s) with equivalent results */
      subplans?: PgNode[];
    }
  }
  /* ----------------
   * FieldSelect
   *
   * FieldSelect represents the operation of extracting one field from a tuple
   * value.  At runtime, the input expression is expected to yield a rowtype
   * Datum.  The specified field number is extracted and returned as a Datum.
   * ----------------
   */
  interface PgFieldSelect extends PgNode {
    FieldSelect: {
      /**/
      xpr: PgExpr;
      /* input expression */
      arg?: PgExpr;
      /* attribute number of field to extract */
      fieldnum: number;
      /* type of the field (result type of this
      								 * node) */

      resulttype: number;
      /* output typmod (usually -1) */
      resulttypmod: number;
      /* OID of collation of the field */
      resultcollid: number;
    }
  }
  /* ----------------
   * FieldStore
   *
   * FieldStore represents the operation of modifying one field in a tuple
   * value, yielding a new tuple value (the input is not touched!).  Like
   * the assign case of ArrayRef, this is used to implement UPDATE of a
   * portion of a column.
   *
   * A single FieldStore can actually represent updates of several different
   * fields.  The parser only generates FieldStores with single-element lists,
   * but the planner will collapse multiple updates of the same base column
   * into one FieldStore.
   * ----------------
   */
  interface PgFieldStore extends PgNode {
    FieldStore: {
      /**/
      xpr: PgExpr;
      /* input tuple value */
      arg?: PgExpr;
      /* new value(s) for field(s) */
      newvals?: PgNode[];
      /* integer list of field attnums */
      fieldnums?: PgNode[];
      /* type of result (same as type of arg) */
      resulttype: number;
    }
  }
  /* ----------------
   * RelabelType
   *
   * RelabelType represents a "dummy" type coercion between two binary-
   * compatible datatypes, such as reinterpreting the result of an OID
   * expression as an int4.  It is a no-op at runtime; we only need it
   * to provide a place to store the correct type to be attributed to
   * the expression result during type resolution.  (We can't get away
   * with just overwriting the type field of the input expression node,
   * so we need a separate node to show the coercion's result type.)
   * ----------------
   */
  interface PgRelabelType extends PgNode {
    RelabelType: {
      /**/
      xpr: PgExpr;
      /* input expression */
      arg?: PgExpr;
      /* output type of coercion expression */
      resulttype: number;
      /* output typmod (usually -1) */
      resulttypmod: number;
      /* OID of collation, or InvalidOid if none */
      resultcollid: number;
      /* how to display this node */
      relabelformat: PgCoercionForm;
      /* token location, or -1 if unknown */
      location: number;
    }
  }
  /* ----------------
   * CoerceViaIO
   *
   * CoerceViaIO represents a type coercion between two types whose textual
   * representations are compatible, implemented by invoking the source type's
   * typoutput function then the destination type's typinput function.
   * ----------------
   */
  interface PgCoerceViaIO extends PgNode {
    CoerceViaIO: {
      /**/
      xpr: PgExpr;
      /* input expression */
      arg?: PgExpr;
      /* output type of coercion */
      resulttype: number;
      /* OID of collation, or InvalidOid if none */
      resultcollid: number;
      /* how to display this node */
      coerceformat: PgCoercionForm;
      /* token location, or -1 if unknown */
      location: number;
    }
  }
  /* ----------------
   * ArrayCoerceExpr
   *
   * ArrayCoerceExpr represents a type coercion from one array type to another,
   * which is implemented by applying the indicated element-type coercion
   * function to each element of the source array.  If elemfuncid is InvalidOid
   * then the element types are binary-compatible, but the coercion still
   * requires some effort (we have to fix the element type ID stored in the
   * array header).
   * ----------------
   */
  interface PgArrayCoerceExpr extends PgNode {
    ArrayCoerceExpr: {
      /**/
      xpr: PgExpr;
      /* input expression (yields an array) */
      arg?: PgExpr;
      /* OID of element coercion function, or 0 */
      elemfuncid: number;
      /* output type of coercion (an array type) */
      resulttype: number;
      /* output typmod (also element typmod) */
      resulttypmod: number;
      /* OID of collation, or InvalidOid if none */
      resultcollid: number;
      /* conversion semantics flag to pass to func */
      isExplicit: boolean;
      /* how to display this node */
      coerceformat: PgCoercionForm;
      /* token location, or -1 if unknown */
      location: number;
    }
  }
  /* ----------------
   * ConvertRowtypeExpr
   *
   * ConvertRowtypeExpr represents a type coercion from one composite type
   * to another, where the source type is guaranteed to contain all the columns
   * needed for the destination type plus possibly others; the columns need not
   * be in the same positions, but are matched up by name.  This is primarily
   * used to convert a whole-row value of an inheritance child table into a
   * valid whole-row value of its parent table's rowtype.
   * ----------------
   */
  interface PgConvertRowtypeExpr extends PgNode {
    ConvertRowtypeExpr: {
      /**/
      xpr: PgExpr;
      /* input expression */
      arg?: PgExpr;
      /* output type (always a composite type) */
      resulttype: number;
      /* how to display this node */
      convertformat: PgCoercionForm;
      /* token location, or -1 if unknown */
      location: number;
    }
  }
  /*----------
   * CollateExpr - COLLATE
   *
   * The planner replaces CollateExpr with RelabelType during expression
   * preprocessing, so execution never sees a CollateExpr.
   *----------
   */
  interface PgCollateExpr extends PgNode {
    CollateExpr: {
      /**/
      xpr: PgExpr;
      /* input expression */
      arg?: PgExpr;
      /* collation's OID */
      collOid: number;
      /* token location, or -1 if unknown */
      location: number;
    }
  }
  /*----------
   * CaseExpr - a CASE expression
   *
   * We support two distinct forms of CASE expression:
   *		CASE WHEN boolexpr THEN expr [ WHEN boolexpr THEN expr ... ]
   *		CASE testexpr WHEN compexpr THEN expr [ WHEN compexpr THEN expr ... ]
   * These are distinguishable by the "arg" field being NULL in the first case
   * and the testexpr in the second case.
   *
   * In the raw grammar output for the second form, the condition expressions
   * of the WHEN clauses are just the comparison values.  Parse analysis
   * converts these to valid boolean expressions of the form
   *		CaseTestExpr '=' compexpr
   * where the CaseTestExpr node is a placeholder that emits the correct
   * value at runtime.  This structure is used so that the testexpr need be
   * evaluated only once.  Note that after parse analysis, the condition
   * expressions always yield boolean.
   *
   * Note: we can test whether a CaseExpr has been through parse analysis
   * yet by checking whether casetype is InvalidOid or not.
   *----------
   */
  interface PgCaseExpr extends PgNode {
    CaseExpr: {
      /**/
      xpr: PgExpr;
      /* type of expression result */
      casetype: number;
      /* OID of collation, or InvalidOid if none */
      casecollid: number;
      /* implicit equality comparison argument */
      arg?: PgExpr;
      /* the arguments (list of WHEN clauses) */
      args?: PgNode[];
      /* the default result (ELSE clause) */
      defresult?: PgExpr;
      /* token location, or -1 if unknown */
      location: number;
    }
  }
  /*
   * CaseWhen - one arm of a CASE expression
   */
  interface PgCaseWhen extends PgNode {
    CaseWhen: {
      /**/
      xpr: PgExpr;
      /* condition expression */
      expr?: PgExpr;
      /* substitution result */
      result?: PgExpr;
      /* token location, or -1 if unknown */
      location: number;
    }
  }
  /*
   * Placeholder node for the test value to be processed by a CASE expression.
   * This is effectively like a Param, but can be implemented more simply
   * since we need only one replacement value at a time.
   *
   * We also use this in nested UPDATE expressions.
   * See transformAssignmentIndirection().
   */
  interface PgCaseTestExpr extends PgNode {
    CaseTestExpr: {
      /**/
      xpr: PgExpr;
      /* type for substituted value */
      typeId: number;
      /* typemod for substituted value */
      typeMod: number;
      /* collation for the substituted value */
      collation: number;
    }
  }
  /*
   * ArrayExpr - an ARRAY[] expression
   *
   * Note: if multidims is false, the constituent expressions all yield the
   * scalar type identified by element_typeid.  If multidims is true, the
   * constituent expressions all yield arrays of element_typeid (ie, the same
   * type as array_typeid); at runtime we must check for compatible subscripts.
   */
  interface PgArrayExpr extends PgNode {
    ArrayExpr: {
      /**/
      xpr: PgExpr;
      /* type of expression result */
      array_typeid: number;
      /* OID of collation, or InvalidOid if none */
      array_collid: number;
      /* common type of array elements */
      element_typeid: number;
      /* the array elements or sub-arrays */
      elements?: PgNode[];
      /* true if elements are sub-arrays */
      multidims: boolean;
      /* token location, or -1 if unknown */
      location: number;
    }
  }
  /*
   * RowExpr - a ROW() expression
   *
   * Note: the list of fields must have a one-for-one correspondence with
   * physical fields of the associated rowtype, although it is okay for it
   * to be shorter than the rowtype.  That is, the N'th list element must
   * match up with the N'th physical field.  When the N'th physical field
   * is a dropped column (attisdropped) then the N'th list element can just
   * be a NULL constant.  (This case can only occur for named composite types,
   * not RECORD types, since those are built from the RowExpr itself rather
   * than vice versa.)  It is important not to assume that length(args) is
   * the same as the number of columns logically present in the rowtype.
   *
   * colnames provides field names in cases where the names can't easily be
   * obtained otherwise.  Names *must* be provided if row_typeid is RECORDOID.
   * If row_typeid identifies a known composite type, colnames can be NIL to
   * indicate the type's cataloged field names apply.  Note that colnames can
   * be non-NIL even for a composite type, and typically is when the RowExpr
   * was created by expanding a whole-row Var.  This is so that we can retain
   * the column alias names of the RTE that the Var referenced (which would
   * otherwise be very difficult to extract from the parsetree).  Like the
   * args list, colnames is one-for-one with physical fields of the rowtype.
   */
  interface PgRowExpr extends PgNode {
    RowExpr: {
      /**/
      xpr: PgExpr;
      /* the fields */
      args?: PgNode[];
      /* RECORDOID or a composite type's ID */
      row_typeid: number;
      /* how to display this node */
      row_format: PgCoercionForm;
      /* list of String, or NIL */
      colnames?: PgNode[];
      /* token location, or -1 if unknown */
      location: number;
    }
  }
  /*
   * RowCompareExpr - row-wise comparison, such as (a, b) <= (1, 2)
   *
   * We support row comparison for any operator that can be determined to
   * act like =, <>, <, <=, >, or >= (we determine this by looking for the
   * operator in btree opfamilies).  Note that the same operator name might
   * map to a different operator for each pair of row elements, since the
   * element datatypes can vary.
   *
   * A RowCompareExpr node is only generated for the < <= > >= cases;
   * the = and <> cases are translated to simple AND or OR combinations
   * of the pairwise comparisons.  However, we include = and <> in the
   * RowCompareType enum for the convenience of parser logic.
   */
  interface PgRowCompareExpr extends PgNode {
    RowCompareExpr: {
      /**/
      xpr: PgExpr;
      /* LT LE GE or GT, never EQ or NE */
      rctype: PgRowCompareType;
      /* OID list of pairwise comparison ops */
      opnos?: PgNode[];
      /* OID list of containing operator families */
      opfamilies?: PgNode[];
      /* OID list of collations for comparisons */
      inputcollids?: PgNode[];
      /* the left-hand input arguments */
      largs?: PgNode[];
      /* the right-hand input arguments */
      rargs?: PgNode[];
    }
  }
  /*
   * CoalesceExpr - a COALESCE expression
   */
  interface PgCoalesceExpr extends PgNode {
    CoalesceExpr: {
      /**/
      xpr: PgExpr;
      /* type of expression result */
      coalescetype: number;
      /* OID of collation, or InvalidOid if none */
      coalescecollid: number;
      /* the arguments */
      args?: PgNode[];
      /* token location, or -1 if unknown */
      location: number;
    }
  }
  /*
   * MinMaxExpr - a GREATEST or LEAST function
   */
  interface PgMinMaxExpr extends PgNode {
    MinMaxExpr: {
      /**/
      xpr: PgExpr;
      /* common type of arguments and result */
      minmaxtype: number;
      /* OID of collation of result */
      minmaxcollid: number;
      /* OID of collation that function should use */
      inputcollid: number;
      /* function to execute */
      op: PgMinMaxOp;
      /* the arguments */
      args?: PgNode[];
      /* token location, or -1 if unknown */
      location: number;
    }
  }
  /**/
  interface PgXmlExpr extends PgNode {
    XmlExpr: {
      /**/
      xpr: PgExpr;
      /* xml function ID */
      op: PgXmlExprOp;
      /* name in xml(NAME foo ...) syntaxes */
      name?: string;
      /* non-XML expressions for xml_attributes */
      named_args?: PgNode[];
      /* parallel list of Value strings */
      arg_names?: PgNode[];
      /* list of expressions */
      args?: PgNode[];
      /* DOCUMENT or CONTENT */
      xmloption: PgXmlOptionType;
      /**/
      typmod: number;
      /* token location, or -1 if unknown */
      location: number;
    }
  }
  /* ----------------
   * NullTest
   *
   * NullTest represents the operation of testing a value for NULLness.
   * The appropriate test is performed and returned as a boolean Datum.
   *
   * NOTE: the semantics of this for rowtype inputs are noticeably different
   * from the scalar case.  We provide an "argisrow" flag to reflect that.
   * ----------------
   */
  interface PgNullTest extends PgNode {
    NullTest: {
      /**/
      xpr: PgExpr;
      /* input expression */
      arg?: PgExpr;
      /* IS NULL, IS NOT NULL */
      nulltesttype: PgNullTestType;
      /* T if input is of a composite type */
      argisrow: boolean;
      /* token location, or -1 if unknown */
      location: number;
    }
  }
  /*
   * BooleanTest
   *
   * BooleanTest represents the operation of determining whether a boolean
   * is TRUE, FALSE, or UNKNOWN (ie, NULL).  All six meaningful combinations
   * are supported.  Note that a NULL input does *not* cause a NULL result.
   * The appropriate test is performed and returned as a boolean Datum.
   */
  interface PgBooleanTest extends PgNode {
    BooleanTest: {
      /**/
      xpr: PgExpr;
      /* input expression */
      arg?: PgExpr;
      /* test type */
      booltesttype: PgBoolTestType;
      /* token location, or -1 if unknown */
      location: number;
    }
  }
  /*
   * CoerceToDomain
   *
   * CoerceToDomain represents the operation of coercing a value to a domain
   * type.  At runtime (and not before) the precise set of constraints to be
   * checked will be determined.  If the value passes, it is returned as the
   * result; if not, an error is raised.  Note that this is equivalent to
   * RelabelType in the scenario where no constraints are applied.
   */
  interface PgCoerceToDomain extends PgNode {
    CoerceToDomain: {
      /**/
      xpr: PgExpr;
      /* input expression */
      arg?: PgExpr;
      /* domain type ID (result type) */
      resulttype: number;
      /* output typmod (currently always -1) */
      resulttypmod: number;
      /* OID of collation, or InvalidOid if none */
      resultcollid: number;
      /* how to display this node */
      coercionformat: PgCoercionForm;
      /* token location, or -1 if unknown */
      location: number;
    }
  }
  /*
   * Placeholder node for the value to be processed by a domain's check
   * constraint.  This is effectively like a Param, but can be implemented more
   * simply since we need only one replacement value at a time.
   *
   * Note: the typeId/typeMod/collation will be set from the domain's base type,
   * not the domain itself.  This is because we shouldn't consider the value
   * to be a member of the domain if we haven't yet checked its constraints.
   */
  interface PgCoerceToDomainValue extends PgNode {
    CoerceToDomainValue: {
      /**/
      xpr: PgExpr;
      /* type for substituted value */
      typeId: number;
      /* typemod for substituted value */
      typeMod: number;
      /* collation for the substituted value */
      collation: number;
      /* token location, or -1 if unknown */
      location: number;
    }
  }
  /*
   * Placeholder node for a DEFAULT marker in an INSERT or UPDATE command.
   *
   * This is not an executable expression: it must be replaced by the actual
   * column default expression during rewriting.  But it is convenient to
   * treat it as an expression node during parsing and rewriting.
   */
  interface PgSetToDefault extends PgNode {
    SetToDefault: {
      /**/
      xpr: PgExpr;
      /* type for substituted value */
      typeId: number;
      /* typemod for substituted value */
      typeMod: number;
      /* collation for the substituted value */
      collation: number;
      /* token location, or -1 if unknown */
      location: number;
    }
  }
  /*
   * Node representing [WHERE] CURRENT OF cursor_name
   *
   * CURRENT OF is a bit like a Var, in that it carries the rangetable index
   * of the target relation being constrained; this aids placing the expression
   * correctly during planning.  We can assume however that its "levelsup" is
   * always zero, due to the syntactic constraints on where it can appear.
   *
   * The referenced cursor can be represented either as a hardwired string
   * or as a reference to a run-time parameter of type REFCURSOR.  The latter
   * case is for the convenience of plpgsql.
   */
  interface PgCurrentOfExpr extends PgNode {
    CurrentOfExpr: {
      /**/
      xpr: PgExpr;
      /* RT index of target relation */
      cvarno: number;
      /* name of referenced cursor, or NULL */
      cursor_name?: string;
      /* refcursor parameter number, or 0 */
      cursor_param: number;
    }
  }
  /*
   * InferenceElem - an element of a unique index inference specification
   *
   * This mostly matches the structure of IndexElems, but having a dedicated
   * primnode allows for a clean separation between the use of index parameters
   * by utility commands, and this node.
   */
  interface PgInferenceElem extends PgNode {
    InferenceElem: {
      /**/
      xpr: PgExpr;
      /* expression to infer from, or NULL */
      expr?: PgNode;
      /* OID of collation, or InvalidOid */
      infercollid: number;
      /* OID of att opclass, or InvalidOid */
      inferopclass: number;
    }
  }
  /*--------------------
   * TargetEntry -
   *	   a target entry (used in query target lists)
   *
   * Strictly speaking, a TargetEntry isn't an expression node (since it can't
   * be evaluated by ExecEvalExpr).  But we treat it as one anyway, since in
   * very many places it's convenient to process a whole query targetlist as a
   * single expression tree.
   *
   * In a SELECT's targetlist, resno should always be equal to the item's
   * ordinal position (counting from 1).  However, in an INSERT or UPDATE
   * targetlist, resno represents the attribute number of the destination
   * column for the item; so there may be missing or out-of-order resnos.
   * It is even legal to have duplicated resnos; consider
   *		UPDATE table SET arraycol[1] = ..., arraycol[2] = ..., ...
   * The two meanings come together in the executor, because the planner
   * transforms INSERT/UPDATE tlists into a normalized form with exactly
   * one entry for each column of the destination table.  Before that's
   * happened, however, it is risky to assume that resno == position.
   * Generally get_tle_by_resno() should be used rather than list_nth()
   * to fetch tlist entries by resno, and only in SELECT should you assume
   * that resno is a unique identifier.
   *
   * resname is required to represent the correct column name in non-resjunk
   * entries of top-level SELECT targetlists, since it will be used as the
   * column title sent to the frontend.  In most other contexts it is only
   * a debugging aid, and may be wrong or even NULL.  (In particular, it may
   * be wrong in a tlist from a stored rule, if the referenced column has been
   * renamed by ALTER TABLE since the rule was made.  Also, the planner tends
   * to store NULL rather than look up a valid name for tlist entries in
   * non-toplevel plan nodes.)  In resjunk entries, resname should be either
   * a specific system-generated name (such as "ctid") or NULL; anything else
   * risks confusing ExecGetJunkAttribute!
   *
   * ressortgroupref is used in the representation of ORDER BY, GROUP BY, and
   * DISTINCT items.  Targetlist entries with ressortgroupref=0 are not
   * sort/group items.  If ressortgroupref>0, then this item is an ORDER BY,
   * GROUP BY, and/or DISTINCT target value.  No two entries in a targetlist
   * may have the same nonzero ressortgroupref --- but there is no particular
   * meaning to the nonzero values, except as tags.  (For example, one must
   * not assume that lower ressortgroupref means a more significant sort key.)
   * The order of the associated SortGroupClause lists determine the semantics.
   *
   * resorigtbl/resorigcol identify the source of the column, if it is a
   * simple reference to a column of a base table (or view).  If it is not
   * a simple reference, these fields are zeroes.
   *
   * If resjunk is true then the column is a working column (such as a sort key)
   * that should be removed from the final output of the query.  Resjunk columns
   * must have resnos that cannot duplicate any regular column's resno.  Also
   * note that there are places that assume resjunk columns come after non-junk
   * columns.
   *--------------------
   */
  interface PgTargetEntry extends PgNode {
    TargetEntry: {
      /**/
      xpr: PgExpr;
      /* expression to evaluate */
      expr?: PgExpr;
      /* attribute number (see notes above) */
      resno: number;
      /* name of the column (could be NULL) */
      resname?: string;
      /* nonzero if referenced by a sort/group
      								 * clause */

      ressortgroupref: number;
      /* OID of column's source table */
      resorigtbl: number;
      /* column's number in source table */
      resorigcol: number;
      /* set to true to eliminate the attribute from
      								 * final target list */

      resjunk: boolean;
    }
  }
  /*
   * RangeTblRef - reference to an entry in the query's rangetable
   *
   * We could use direct pointers to the RT entries and skip having these
   * nodes, but multiple pointers to the same node in a querytree cause
   * lots of headaches, so it seems better to store an index into the RT.
   */
  interface PgRangeTblRef extends PgNode {
    RangeTblRef: {
      /**/
      rtindex: number;
    }
  }
  /*----------
   * JoinExpr - for SQL JOIN expressions
   *
   * isNatural, usingClause, and quals are interdependent.  The user can write
   * only one of NATURAL, USING(), or ON() (this is enforced by the grammar).
   * If he writes NATURAL then parse analysis generates the equivalent USING()
   * list, and from that fills in "quals" with the right equality comparisons.
   * If he writes USING() then "quals" is filled with equality comparisons.
   * If he writes ON() then only "quals" is set.  Note that NATURAL/USING
   * are not equivalent to ON() since they also affect the output column list.
   *
   * alias is an Alias node representing the AS alias-clause attached to the
   * join expression, or NULL if no clause.  NB: presence or absence of the
   * alias has a critical impact on semantics, because a join with an alias
   * restricts visibility of the tables/columns inside it.
   *
   * During parse analysis, an RTE is created for the Join, and its index
   * is filled into rtindex.  This RTE is present mainly so that Vars can
   * be created that refer to the outputs of the join.  The planner sometimes
   * generates JoinExprs internally; these can have rtindex = 0 if there are
   * no join alias variables referencing such joins.
   *----------
   */
  interface PgJoinExpr extends PgNode {
    JoinExpr: {
      /* type of join */
      jointype: PgJoinType;
      /* Natural join? Will need to shape table */
      isNatural: boolean;
      /* left subtree */
      larg?: PgNode;
      /* right subtree */
      rarg?: PgNode;
      /* USING clause, if any (list of String) */
      usingClause?: PgNode[];
      /* qualifiers on join, if any */
      quals?: PgNode;
      /* user-written alias clause, if any */
      alias?: PgAlias;
      /* RT index assigned for join, or 0 */
      rtindex: number;
    }
  }
  /*----------
   * FromExpr - represents a FROM ... WHERE ... construct
   *
   * This is both more flexible than a JoinExpr (it can have any number of
   * children, including zero) and less so --- we don't need to deal with
   * aliases and so on.  The output column set is implicitly just the union
   * of the outputs of the children.
   *----------
   */
  interface PgFromExpr extends PgNode {
    FromExpr: {
      /* List of join subtrees */
      fromlist?: PgNode[];
      /* qualifiers on join, if any */
      quals?: PgNode;
    }
  }
  /*----------
   * OnConflictExpr - represents an ON CONFLICT DO ... expression
   *
   * The optimizer requires a list of inference elements, and optionally a WHERE
   * clause to infer a unique index.  The unique index (or, occasionally,
   * indexes) inferred are used to arbitrate whether or not the alternative ON
   * CONFLICT path is taken.
   *----------
   */
  interface PgOnConflictExpr extends PgNode {
    OnConflictExpr: {
      /* DO NOTHING or UPDATE? */
      action: PgOnConflictAction;
      /* unique index arbiter list (of
      								 * InferenceElem's) */

      arbiterElems?: PgNode[];
      /* unique index arbiter WHERE clause */
      arbiterWhere?: PgNode;
      /* pg_constraint OID for arbiter */
      constraint: number;
      /* List of ON CONFLICT SET TargetEntrys */
      onConflictSet?: PgNode[];
      /* qualifiers to restrict UPDATE to */
      onConflictWhere?: PgNode;
      /* RT index of 'excluded' relation */
      exclRelIndex: number;
      /* tlist of the EXCLUDED pseudo relation */
      exclRelTlist?: PgNode[];
    }
  }
  /*
   * Query -
   *	  Parse analysis turns all statements into a Query tree
   *	  for further processing by the rewriter and planner.
   *
   *	  Utility statements (i.e. non-optimizable statements) have the
   *	  utilityStmt field set, and the Query itself is mostly dummy.
   *	  DECLARE CURSOR is a special case: it is represented like a SELECT,
   *	  but the original DeclareCursorStmt is stored in utilityStmt.
   *
   *	  Planning converts a Query tree into a Plan tree headed by a PlannedStmt
   *	  node --- the Query structure is not used by the executor.
   */
  interface PgQuery extends PgNode {
    Query: {
      /* select|insert|update|delete|utility */
      commandType: PgCmdType;
      /* where did I come from? */
      querySource: PgQuerySource;
      /* query identifier (can be set by plugins) */
      queryId: number;
      /* do I set the command result tag? */
      canSetTag: boolean;
      /* non-null if this is DECLARE CURSOR or a
      								 * non-optimizable statement */

      utilityStmt?: PgNode;
      /* rtable index of target relation for
      								 * INSERT/UPDATE/DELETE; 0 for SELECT */

      resultRelation: number;
      /* has aggregates in tlist or havingQual */
      hasAggs: boolean;
      /* has window functions in tlist */
      hasWindowFuncs: boolean;
      /* has subquery SubLink */
      hasSubLinks: boolean;
      /* distinctClause is from DISTINCT ON */
      hasDistinctOn: boolean;
      /* WITH RECURSIVE was specified */
      hasRecursive: boolean;
      /* has INSERT/UPDATE/DELETE in WITH */
      hasModifyingCTE: boolean;
      /* FOR [KEY] UPDATE/SHARE was specified */
      hasForUpdate: boolean;
      /* row security applied? */
      hasRowSecurity: boolean;
      /* WITH list (of CommonTableExpr's) */
      cteList?: PgNode[];
      /* list of range table entries */
      rtable?: PgNode[];
      /* table join tree (FROM and WHERE clauses) */
      jointree?: PgFromExpr;
      /* target list (of TargetEntry) */
      targetList?: PgNode[];
      /* ON CONFLICT DO [NOTHING | UPDATE] */
      onConflict?: PgOnConflictExpr;
      /* return-values list (of TargetEntry) */
      returningList?: PgNode[];
      /* a list of SortGroupClause's */
      groupClause?: PgNode[];
      /* a list of GroupingSet's if present */
      groupingSets?: PgNode[];
      /* qualifications applied to groups */
      havingQual?: PgNode;
      /* a list of WindowClause's */
      windowClause?: PgNode[];
      /* a list of SortGroupClause's */
      distinctClause?: PgNode[];
      /* a list of SortGroupClause's */
      sortClause?: PgNode[];
      /* # of result tuples to skip (int8 expr) */
      limitOffset?: PgNode;
      /* # of result tuples to return (int8 expr) */
      limitCount?: PgNode;
      /* a list of RowMarkClause's */
      rowMarks?: PgNode[];
      /* set-operation tree if this is top level of
      								 * a UNION/INTERSECT/EXCEPT query */

      setOperations?: PgNode;
      /* a list of pg_constraint OIDs that the query
      								 * depends on to be semantically valid */

      constraintDeps?: PgNode[];
      /* a list of WithCheckOption's, which are
      									 * only added during rewrite and therefore
      									 * are not written out as part of Query. */

      withCheckOptions?: PgNode[];
    }
  }
  /*
   * TypeName - specifies a type in definitions
   *
   * For TypeName structures generated internally, it is often easier to
   * specify the type by OID than by name.  If "names" is NIL then the
   * actual type OID is given by typeOid, otherwise typeOid is unused.
   * Similarly, if "typmods" is NIL then the actual typmod is expected to
   * be prespecified in typemod, otherwise typemod is unused.
   *
   * If pct_type is TRUE, then names is actually a field name and we look up
   * the type of that field.  Otherwise (the normal case), names is a type
   * name possibly qualified with schema and database name.
   */
  interface PgTypeName extends PgNode {
    TypeName: {
      /* qualified name (list of Value strings) */
      names?: PgNode[];
      /* type identified by OID */
      typeOid: number;
      /* is a set? */
      setof: boolean;
      /* %TYPE specified? */
      pct_type: boolean;
      /* type modifier expression(s) */
      typmods?: PgNode[];
      /* prespecified type modifier */
      typemod: number;
      /* array bounds */
      arrayBounds?: PgNode[];
      /* token location, or -1 if unknown */
      location: number;
    }
  }
  /*
   * ColumnRef - specifies a reference to a column, or possibly a whole tuple
   *
   * The "fields" list must be nonempty.  It can contain string Value nodes
   * (representing names) and A_Star nodes (representing occurrence of a '*').
   * Currently, A_Star must appear only as the last list element --- the grammar
   * is responsible for enforcing this!
   *
   * Note: any array subscripting or selection of fields from composite columns
   * is represented by an A_Indirection node above the ColumnRef.  However,
   * for simplicity in the normal case, initial field selection from a table
   * name is represented within ColumnRef and not by adding A_Indirection.
   */
  interface PgColumnRef extends PgNode {
    ColumnRef: {
      /* field names (Value strings) or A_Star */
      fields?: PgNode[];
      /* token location, or -1 if unknown */
      location: number;
    }
  }
  /*
   * ParamRef - specifies a $n parameter reference
   */
  interface PgParamRef extends PgNode {
    ParamRef: {
      /* the number of the parameter */
      number: number;
      /* token location, or -1 if unknown */
      location: number;
    }
  }
  /*
   * A_Expr - infix, prefix, and postfix expressions
   */
  interface PgA_Expr extends PgNode {
    A_Expr: {
      /* see above */
      kind: PgA_Expr_Kind;
      /* possibly-qualified name of operator */
      name?: PgNode[];
      /* left argument, or NULL if none */
      lexpr?: PgNode;
      /* right argument, or NULL if none */
      rexpr?: PgNode;
      /* token location, or -1 if unknown */
      location: number;
    }
  }
  /*
   * A_Const - a literal constant
   */
  interface PgA_Const extends PgNode {
    A_Const: {
      /* value (includes type info, see value.h) */
      val: any;
      /* token location, or -1 if unknown */
      location: number;
    }
  }
  /*
   * TypeCast - a CAST expression
   */
  interface PgTypeCast extends PgNode {
    TypeCast: {
      /* the expression being casted */
      arg?: PgNode;
      /* the target type */
      typeName?: PgTypeName;
      /* token location, or -1 if unknown */
      location: number;
    }
  }
  /*
   * CollateClause - a COLLATE expression
   */
  interface PgCollateClause extends PgNode {
    CollateClause: {
      /* input expression */
      arg?: PgNode;
      /* possibly-qualified collation name */
      collname?: PgNode[];
      /* token location, or -1 if unknown */
      location: number;
    }
  }
  /**/
  interface PgRoleSpec extends PgNode {
    RoleSpec: {
      /* Type of this rolespec */
      roletype: PgRoleSpecType;
      /* filled only for ROLESPEC_CSTRING */
      rolename?: string;
      /* token location, or -1 if unknown */
      location: number;
    }
  }
  /*
   * FuncCall - a function or aggregate invocation
   *
   * agg_order (if not NIL) indicates we saw 'foo(... ORDER BY ...)', or if
   * agg_within_group is true, it was 'foo(...) WITHIN GROUP (ORDER BY ...)'.
   * agg_star indicates we saw a 'foo(*)' construct, while agg_distinct
   * indicates we saw 'foo(DISTINCT ...)'.  In any of these cases, the
   * construct *must* be an aggregate call.  Otherwise, it might be either an
   * aggregate or some other kind of function.  However, if FILTER or OVER is
   * present it had better be an aggregate or window function.
   *
   * Normally, you'd initialize this via makeFuncCall() and then only change the
   * parts of the struct its defaults don't match afterwards, as needed.
   */
  interface PgFuncCall extends PgNode {
    FuncCall: {
      /* qualified name of function */
      funcname?: PgNode[];
      /* the arguments (list of exprs) */
      args?: PgNode[];
      /* ORDER BY (list of SortBy) */
      agg_order?: PgNode[];
      /* FILTER clause, if any */
      agg_filter?: PgNode;
      /* ORDER BY appeared in WITHIN GROUP */
      agg_within_group: boolean;
      /* argument was really '*' */
      agg_star: boolean;
      /* arguments were labeled DISTINCT */
      agg_distinct: boolean;
      /* last argument was labeled VARIADIC */
      func_variadic: boolean;
      /* OVER clause, if any */
      over?: PgWindowDef;
      /* token location, or -1 if unknown */
      location: number;
    }
  }
  /*
   * A_Star - '*' representing all columns of a table or compound field
   *
   * This can appear within ColumnRef.fields, A_Indirection.indirection, and
   * ResTarget.indirection lists.
   */
  interface PgA_Star extends PgNode {
    A_Star: {

    }
  }
  /*
   * A_Indices - array subscript or slice bounds ([lidx:uidx] or [uidx])
   */
  interface PgA_Indices extends PgNode {
    A_Indices: {
      /* NULL if it's a single subscript */
      lidx?: PgNode;
      /**/
      uidx?: PgNode;
    }
  }
  /*
   * A_Indirection - select a field and/or array element from an expression
   *
   * The indirection list can contain A_Indices nodes (representing
   * subscripting), string Value nodes (representing field selection --- the
   * string value is the name of the field to select), and A_Star nodes
   * (representing selection of all fields of a composite type).
   * For example, a complex selection operation like
   *				(foo).field1[42][7].field2
   * would be represented with a single A_Indirection node having a 4-element
   * indirection list.
   *
   * Currently, A_Star must appear only as the last list element --- the grammar
   * is responsible for enforcing this!
   */
  interface PgA_Indirection extends PgNode {
    A_Indirection: {
      /* the thing being selected from */
      arg?: PgNode;
      /* subscripts and/or field names and/or * */
      indirection?: PgNode[];
    }
  }
  /*
   * A_ArrayExpr - an ARRAY[] construct
   */
  interface PgA_ArrayExpr extends PgNode {
    A_ArrayExpr: {
      /* array element expressions */
      elements?: PgNode[];
      /* token location, or -1 if unknown */
      location: number;
    }
  }
  /*
   * ResTarget -
   *	  result target (used in target list of pre-transformed parse trees)
   *
   * In a SELECT target list, 'name' is the column label from an
   * 'AS ColumnLabel' clause, or NULL if there was none, and 'val' is the
   * value expression itself.  The 'indirection' field is not used.
   *
   * INSERT uses ResTarget in its target-column-names list.  Here, 'name' is
   * the name of the destination column, 'indirection' stores any subscripts
   * attached to the destination, and 'val' is not used.
   *
   * In an UPDATE target list, 'name' is the name of the destination column,
   * 'indirection' stores any subscripts attached to the destination, and
   * 'val' is the expression to assign.
   *
   * See A_Indirection for more info about what can appear in 'indirection'.
   */
  interface PgResTarget extends PgNode {
    ResTarget: {
      /* column name or NULL */
      name?: string;
      /* subscripts, field names, and '*', or NIL */
      indirection?: PgNode[];
      /* the value expression to compute or assign */
      val?: PgNode;
      /* token location, or -1 if unknown */
      location: number;
    }
  }
  /*
   * MultiAssignRef - element of a row source expression for UPDATE
   *
   * In an UPDATE target list, when we have SET (a,b,c) = row-valued-expression,
   * we generate separate ResTarget items for each of a,b,c.  Their "val" trees
   * are MultiAssignRef nodes numbered 1..n, linking to a common copy of the
   * row-valued-expression (which parse analysis will process only once, when
   * handling the MultiAssignRef with colno=1).
   */
  interface PgMultiAssignRef extends PgNode {
    MultiAssignRef: {
      /* the row-valued expression */
      source?: PgNode;
      /* column number for this target (1..n) */
      colno: number;
      /* number of targets in the construct */
      ncolumns: number;
    }
  }
  /*
   * SortBy - for ORDER BY clause
   */
  interface PgSortBy extends PgNode {
    SortBy: {
      /* expression to sort on */
      node?: PgNode;
      /* ASC/DESC/USING/default */
      sortby_dir: PgSortByDir;
      /* NULLS FIRST/LAST */
      sortby_nulls: PgSortByNulls;
      /* name of op to use, if SORTBY_USING */
      useOp?: PgNode[];
      /* operator location, or -1 if none/unknown */
      location: number;
    }
  }
  /*
   * WindowDef - raw representation of WINDOW and OVER clauses
   *
   * For entries in a WINDOW list, "name" is the window name being defined.
   * For OVER clauses, we use "name" for the "OVER window" syntax, or "refname"
   * for the "OVER (window)" syntax, which is subtly different --- the latter
   * implies overriding the window frame clause.
   */
  interface PgWindowDef extends PgNode {
    WindowDef: {
      /* window's own name */
      name?: string;
      /* referenced window name, if any */
      refname?: string;
      /* PARTITION BY expression list */
      partitionClause?: PgNode[];
      /* ORDER BY (list of SortBy) */
      orderClause?: PgNode[];
      /* frame_clause options, see below */
      frameOptions: number;
      /* expression for starting bound, if any */
      startOffset?: PgNode;
      /* expression for ending bound, if any */
      endOffset?: PgNode;
      /* parse location, or -1 if none/unknown */
      location: number;
    }
  }
  /*
   * RangeSubselect - subquery appearing in a FROM clause
   */
  interface PgRangeSubselect extends PgNode {
    RangeSubselect: {
      /* does it have LATERAL prefix? */
      lateral: boolean;
      /* the untransformed sub-select clause */
      subquery?: PgNode;
      /* table alias & optional column aliases */
      alias?: PgAlias;
    }
  }
  /*
   * RangeFunction - function call appearing in a FROM clause
   *
   * functions is a List because we use this to represent the construct
   * ROWS FROM(func1(...), func2(...), ...).  Each element of this list is a
   * two-element sublist, the first element being the untransformed function
   * call tree, and the second element being a possibly-empty list of ColumnDef
   * nodes representing any columndef list attached to that function within the
   * ROWS FROM() syntax.
   *
   * alias and coldeflist represent any alias and/or columndef list attached
   * at the top level.  (We disallow coldeflist appearing both here and
   * per-function, but that's checked in parse analysis, not by the grammar.)
   */
  interface PgRangeFunction extends PgNode {
    RangeFunction: {
      /* does it have LATERAL prefix? */
      lateral: boolean;
      /* does it have WITH ORDINALITY suffix? */
      ordinality: boolean;
      /* is result of ROWS FROM() syntax? */
      is_rowsfrom: boolean;
      /* per-function information, see above */
      functions?: PgNode[];
      /* table alias & optional column aliases */
      alias?: PgAlias;
      /* list of ColumnDef nodes to describe result
      								 * of function returning RECORD */

      coldeflist?: PgNode[];
    }
  }
  /*
   * RangeTableSample - TABLESAMPLE appearing in a raw FROM clause
   *
   * This node, appearing only in raw parse trees, represents
   *		<relation> TABLESAMPLE <method> (<params>) REPEATABLE (<num>)
   * Currently, the <relation> can only be a RangeVar, but we might in future
   * allow RangeSubselect and other options.  Note that the RangeTableSample
   * is wrapped around the node representing the <relation>, rather than being
   * a subfield of it.
   */
  interface PgRangeTableSample extends PgNode {
    RangeTableSample: {
      /* relation to be sampled */
      relation?: PgNode;
      /* sampling method name (possibly qualified) */
      method?: PgNode[];
      /* argument(s) for sampling method */
      args?: PgNode[];
      /* REPEATABLE expression, or NULL if none */
      repeatable?: PgNode;
      /* method name location, or -1 if unknown */
      location: number;
    }
  }
  /*
   * ColumnDef - column definition (used in various creates)
   *
   * If the column has a default value, we may have the value expression
   * in either "raw" form (an untransformed parse tree) or "cooked" form
   * (a post-parse-analysis, executable expression tree), depending on
   * how this ColumnDef node was created (by parsing, or by inheritance
   * from an existing relation).  We should never have both in the same node!
   *
   * Similarly, we may have a COLLATE specification in either raw form
   * (represented as a CollateClause with arg==NULL) or cooked form
   * (the collation's OID).
   *
   * The constraints list may contain a CONSTR_DEFAULT item in a raw
   * parsetree produced by gram.y, but transformCreateStmt will remove
   * the item and set raw_default instead.  CONSTR_DEFAULT items
   * should not appear in any subsequent processing.
   */
  interface PgColumnDef extends PgNode {
    ColumnDef: {
      /* name of column */
      colname?: string;
      /* type of column */
      typeName?: PgTypeName;
      /* number of times column is inherited */
      inhcount: number;
      /* column has local (non-inherited) def'n */
      is_local: boolean;
      /* NOT NULL constraint specified? */
      is_not_null: boolean;
      /* column definition came from table type */
      is_from_type: boolean;
      /* attstorage setting, or 0 for default */
      storage: string;
      /* default value (untransformed parse tree) */
      raw_default?: PgNode;
      /* default value (transformed expr tree) */
      cooked_default?: PgNode;
      /* untransformed COLLATE spec, if any */
      collClause?: PgCollateClause;
      /* collation OID (InvalidOid if not set) */
      collOid: number;
      /* other constraints on column */
      constraints?: PgNode[];
      /* per-column FDW options */
      fdwoptions?: PgNode[];
      /* parse location, or -1 if none/unknown */
      location: number;
    }
  }
  /*
   * TableLikeClause - CREATE TABLE ( ... LIKE ... ) clause
   */
  interface PgTableLikeClause extends PgNode {
    TableLikeClause: {
      /**/
      relation?: PgRangeVar;
      /* OR of TableLikeOption flags */
      options: number;
    }
  }
  /*
   * IndexElem - index parameters (used in CREATE INDEX, and in ON CONFLICT)
   *
   * For a plain index attribute, 'name' is the name of the table column to
   * index, and 'expr' is NULL.  For an index expression, 'name' is NULL and
   * 'expr' is the expression tree.
   */
  interface PgIndexElem extends PgNode {
    IndexElem: {
      /* name of attribute to index, or NULL */
      name?: string;
      /* expression to index, or NULL */
      expr?: PgNode;
      /* name for index column; NULL = default */
      indexcolname?: string;
      /* name of collation; NIL = default */
      collation?: PgNode[];
      /* name of desired opclass; NIL = default */
      opclass?: PgNode[];
      /* ASC/DESC/default */
      ordering: PgSortByDir;
      /* FIRST/LAST/default */
      nulls_ordering: PgSortByNulls;
    }
  }
  /*
   * DefElem - a generic "name = value" option definition
   *
   * In some contexts the name can be qualified.  Also, certain SQL commands
   * allow a SET/ADD/DROP action to be attached to option settings, so it's
   * convenient to carry a field for that too.  (Note: currently, it is our
   * practice that the grammar allows namespace and action only in statements
   * where they are relevant; C code can just ignore those fields in other
   * statements.)
   */
  interface PgDefElem extends PgNode {
    DefElem: {
      /* NULL if unqualified name */
      defnamespace?: string;
      /**/
      defname?: string;
      /* a (Value *) or a (TypeName *) */
      arg?: PgNode;
      /* unspecified action, or SET/ADD/DROP */
      defaction: PgDefElemAction;
    }
  }
  /*
   * LockingClause - raw representation of FOR [NO KEY] UPDATE/[KEY] SHARE
   *		options
   *
   * Note: lockedRels == NIL means "all relations in query".  Otherwise it
   * is a list of RangeVar nodes.  (We use RangeVar mainly because it carries
   * a location field --- currently, parse analysis insists on unqualified
   * names in LockingClause.)
   */
  interface PgLockingClause extends PgNode {
    LockingClause: {
      /* FOR [KEY] UPDATE/SHARE relations */
      lockedRels?: PgNode[];
      /**/
      strength: PgLockClauseStrength;
      /* NOWAIT and SKIP LOCKED */
      waitPolicy: PgLockWaitPolicy;
    }
  }
  /*
   * XMLSERIALIZE (in raw parse tree only)
   */
  interface PgXmlSerialize extends PgNode {
    XmlSerialize: {
      /* DOCUMENT or CONTENT */
      xmloption: PgXmlOptionType;
      /**/
      expr?: PgNode;
      /**/
      typeName?: PgTypeName;
      /* token location, or -1 if unknown */
      location: number;
    }
  }
  /*--------------------
   * RangeTblEntry -
   *	  A range table is a List of RangeTblEntry nodes.
   *
   *	  A range table entry may represent a plain relation, a sub-select in
   *	  FROM, or the result of a JOIN clause.  (Only explicit JOIN syntax
   *	  produces an RTE, not the implicit join resulting from multiple FROM
   *	  items.  This is because we only need the RTE to deal with SQL features
   *	  like outer joins and join-output-column aliasing.)  Other special
   *	  RTE types also exist, as indicated by RTEKind.
   *
   *	  Note that we consider RTE_RELATION to cover anything that has a pg_class
   *	  entry.  relkind distinguishes the sub-cases.
   *
   *	  alias is an Alias node representing the AS alias-clause attached to the
   *	  FROM expression, or NULL if no clause.
   *
   *	  eref is the table reference name and column reference names (either
   *	  real or aliases).  Note that system columns (OID etc) are not included
   *	  in the column list.
   *	  eref->aliasname is required to be present, and should generally be used
   *	  to identify the RTE for error messages etc.
   *
   *	  In RELATION RTEs, the colnames in both alias and eref are indexed by
   *	  physical attribute number; this means there must be colname entries for
   *	  dropped columns.  When building an RTE we insert empty strings ("") for
   *	  dropped columns.  Note however that a stored rule may have nonempty
   *	  colnames for columns dropped since the rule was created (and for that
   *	  matter the colnames might be out of date due to column renamings).
   *	  The same comments apply to FUNCTION RTEs when a function's return type
   *	  is a named composite type.
   *
   *	  In JOIN RTEs, the colnames in both alias and eref are one-to-one with
   *	  joinaliasvars entries.  A JOIN RTE will omit columns of its inputs when
   *	  those columns are known to be dropped at parse time.  Again, however,
   *	  a stored rule might contain entries for columns dropped since the rule
   *	  was created.  (This is only possible for columns not actually referenced
   *	  in the rule.)  When loading a stored rule, we replace the joinaliasvars
   *	  items for any such columns with null pointers.  (We can't simply delete
   *	  them from the joinaliasvars list, because that would affect the attnums
   *	  of Vars referencing the rest of the list.)
   *
   *	  inh is TRUE for relation references that should be expanded to include
   *	  inheritance children, if the rel has any.  This *must* be FALSE for
   *	  RTEs other than RTE_RELATION entries.
   *
   *	  inFromCl marks those range variables that are listed in the FROM clause.
   *	  It's false for RTEs that are added to a query behind the scenes, such
   *	  as the NEW and OLD variables for a rule, or the subqueries of a UNION.
   *	  This flag is not used anymore during parsing, since the parser now uses
   *	  a separate "namespace" data structure to control visibility, but it is
   *	  needed by ruleutils.c to determine whether RTEs should be shown in
   *	  decompiled queries.
   *
   *	  requiredPerms and checkAsUser specify run-time access permissions
   *	  checks to be performed at query startup.  The user must have *all*
   *	  of the permissions that are OR'd together in requiredPerms (zero
   *	  indicates no permissions checking).  If checkAsUser is not zero,
   *	  then do the permissions checks using the access rights of that user,
   *	  not the current effective user ID.  (This allows rules to act as
   *	  setuid gateways.)  Permissions checks only apply to RELATION RTEs.
   *
   *	  For SELECT/INSERT/UPDATE permissions, if the user doesn't have
   *	  table-wide permissions then it is sufficient to have the permissions
   *	  on all columns identified in selectedCols (for SELECT) and/or
   *	  insertedCols and/or updatedCols (INSERT with ON CONFLICT DO UPDATE may
   *	  have all 3).  selectedCols, insertedCols and updatedCols are bitmapsets,
   *	  which cannot have negative integer members, so we subtract
   *	  FirstLowInvalidHeapAttributeNumber from column numbers before storing
   *	  them in these fields.  A whole-row Var reference is represented by
   *	  setting the bit for InvalidAttrNumber.
   *--------------------
   */
  interface PgRangeTblEntry extends PgNode {
    RangeTblEntry: {
      /* see above */
      rtekind: PgRTEKind;
      /* OID of the relation */
      relid: number;
      /* relation kind (see pg_class.relkind) */
      relkind: string;
      /* sampling info, or NULL */
      tablesample?: PgTableSampleClause;
      /* the sub-query */
      subquery?: PgQuery;
      /* is from security_barrier view? */
      security_barrier: boolean;
      /* type of join */
      jointype: PgJoinType;
      /* list of alias-var expansions */
      joinaliasvars?: PgNode[];
      /* list of RangeTblFunction nodes */
      functions?: PgNode[];
      /* is this called WITH ORDINALITY? */
      funcordinality: boolean;
      /* list of expression lists */
      values_lists?: PgNode[];
      /* OID list of column collation OIDs */
      values_collations?: PgNode[];
      /* name of the WITH list item */
      ctename?: string;
      /* number of query levels up */
      ctelevelsup: number;
      /* is this a recursive self-reference? */
      self_reference: boolean;
      /* OID list of column type OIDs */
      ctecoltypes?: PgNode[];
      /* integer list of column typmods */
      ctecoltypmods?: PgNode[];
      /* OID list of column collation OIDs */
      ctecolcollations?: PgNode[];
      /* user-written alias clause, if any */
      alias?: PgAlias;
      /* expanded reference names */
      eref?: PgAlias;
      /* subquery, function, or values is LATERAL? */
      lateral: boolean;
      /* inheritance requested? */
      inh: boolean;
      /* present in FROM clause? */
      inFromCl: boolean;
      /* bitmask of required access permissions */
      requiredPerms: any;
      /* if valid, check access as this role */
      checkAsUser: number;
      /* columns needing SELECT permission */
      selectedCols?: any;
      /* columns needing INSERT permission */
      insertedCols?: any;
      /* columns needing UPDATE permission */
      updatedCols?: any;
      /* any security barrier quals to apply */
      securityQuals?: PgNode[];
    }
  }
  /*
   * RangeTblFunction -
   *	  RangeTblEntry subsidiary data for one function in a FUNCTION RTE.
   *
   * If the function had a column definition list (required for an
   * otherwise-unspecified RECORD result), funccolnames lists the names given
   * in the definition list, funccoltypes lists their declared column types,
   * funccoltypmods lists their typmods, funccolcollations their collations.
   * Otherwise, those fields are NIL.
   *
   * Notice we don't attempt to store info about the results of functions
   * returning named composite types, because those can change from time to
   * time.  We do however remember how many columns we thought the type had
   * (including dropped columns!), so that we can successfully ignore any
   * columns added after the query was parsed.
   */
  interface PgRangeTblFunction extends PgNode {
    RangeTblFunction: {
      /* expression tree for func call */
      funcexpr?: PgNode;
      /* number of columns it contributes to RTE */
      funccolcount: number;
      /* column names (list of String) */
      funccolnames?: PgNode[];
      /* OID list of column type OIDs */
      funccoltypes?: PgNode[];
      /* integer list of column typmods */
      funccoltypmods?: PgNode[];
      /* OID list of column collation OIDs */
      funccolcollations?: PgNode[];
      /* PARAM_EXEC Param IDs affecting this func */
      funcparams?: any;
    }
  }
  /*
   * TableSampleClause - TABLESAMPLE appearing in a transformed FROM clause
   *
   * Unlike RangeTableSample, this is a subnode of the relevant RangeTblEntry.
   */
  interface PgTableSampleClause extends PgNode {
    TableSampleClause: {
      /* OID of the tablesample handler function */
      tsmhandler: number;
      /* tablesample argument expression(s) */
      args?: PgNode[];
      /* REPEATABLE expression, or NULL if none */
      repeatable?: PgExpr;
    }
  }
  /**/
  interface PgWithCheckOption extends PgNode {
    WithCheckOption: {
      /* kind of WCO */
      kind: PgWCOKind;
      /* name of relation that specified the WCO */
      relname?: string;
      /* name of RLS policy being checked */
      polname?: string;
      /* constraint qual to check */
      qual?: PgNode;
      /* true for a cascaded WCO on a view */
      cascaded: boolean;
    }
  }
  /*
   * SortGroupClause -
   *		representation of ORDER BY, GROUP BY, PARTITION BY,
   *		DISTINCT, DISTINCT ON items
   *
   * You might think that ORDER BY is only interested in defining ordering,
   * and GROUP/DISTINCT are only interested in defining equality.  However,
   * one way to implement grouping is to sort and then apply a "uniq"-like
   * filter.  So it's also interesting to keep track of possible sort operators
   * for GROUP/DISTINCT, and in particular to try to sort for the grouping
   * in a way that will also yield a requested ORDER BY ordering.  So we need
   * to be able to compare ORDER BY and GROUP/DISTINCT lists, which motivates
   * the decision to give them the same representation.
   *
   * tleSortGroupRef must match ressortgroupref of exactly one entry of the
   *		query's targetlist; that is the expression to be sorted or grouped by.
   * eqop is the OID of the equality operator.
   * sortop is the OID of the ordering operator (a "<" or ">" operator),
   *		or InvalidOid if not available.
   * nulls_first means about what you'd expect.  If sortop is InvalidOid
   *		then nulls_first is meaningless and should be set to false.
   * hashable is TRUE if eqop is hashable (note this condition also depends
   *		on the datatype of the input expression).
   *
   * In an ORDER BY item, all fields must be valid.  (The eqop isn't essential
   * here, but it's cheap to get it along with the sortop, and requiring it
   * to be valid eases comparisons to grouping items.)  Note that this isn't
   * actually enough information to determine an ordering: if the sortop is
   * collation-sensitive, a collation OID is needed too.  We don't store the
   * collation in SortGroupClause because it's not available at the time the
   * parser builds the SortGroupClause; instead, consult the exposed collation
   * of the referenced targetlist expression to find out what it is.
   *
   * In a grouping item, eqop must be valid.  If the eqop is a btree equality
   * operator, then sortop should be set to a compatible ordering operator.
   * We prefer to set eqop/sortop/nulls_first to match any ORDER BY item that
   * the query presents for the same tlist item.  If there is none, we just
   * use the default ordering op for the datatype.
   *
   * If the tlist item's type has a hash opclass but no btree opclass, then
   * we will set eqop to the hash equality operator, sortop to InvalidOid,
   * and nulls_first to false.  A grouping item of this kind can only be
   * implemented by hashing, and of course it'll never match an ORDER BY item.
   *
   * The hashable flag is provided since we generally have the requisite
   * information readily available when the SortGroupClause is constructed,
   * and it's relatively expensive to get it again later.  Note there is no
   * need for a "sortable" flag since OidIsValid(sortop) serves the purpose.
   *
   * A query might have both ORDER BY and DISTINCT (or DISTINCT ON) clauses.
   * In SELECT DISTINCT, the distinctClause list is as long or longer than the
   * sortClause list, while in SELECT DISTINCT ON it's typically shorter.
   * The two lists must match up to the end of the shorter one --- the parser
   * rearranges the distinctClause if necessary to make this true.  (This
   * restriction ensures that only one sort step is needed to both satisfy the
   * ORDER BY and set up for the Unique step.  This is semantically necessary
   * for DISTINCT ON, and presents no real drawback for DISTINCT.)
   */
  interface PgSortGroupClause extends PgNode {
    SortGroupClause: {
      /* reference into targetlist */
      tleSortGroupRef: number;
      /* the equality operator ('=' op) */
      eqop: number;
      /* the ordering operator ('<' op), or 0 */
      sortop: number;
      /* do NULLs come before normal values? */
      nulls_first: boolean;
      /* can eqop be implemented by hashing? */
      hashable: boolean;
    }
  }
  /**/
  interface PgGroupingSet extends PgNode {
    GroupingSet: {
      /**/
      kind: PgGroupingSetKind;
      /**/
      content?: PgNode[];
      /**/
      location: number;
    }
  }
  /*
   * WindowClause -
   *		transformed representation of WINDOW and OVER clauses
   *
   * A parsed Query's windowClause list contains these structs.  "name" is set
   * if the clause originally came from WINDOW, and is NULL if it originally
   * was an OVER clause (but note that we collapse out duplicate OVERs).
   * partitionClause and orderClause are lists of SortGroupClause structs.
   * winref is an ID number referenced by WindowFunc nodes; it must be unique
   * among the members of a Query's windowClause list.
   * When refname isn't null, the partitionClause is always copied from there;
   * the orderClause might or might not be copied (see copiedOrder); the framing
   * options are never copied, per spec.
   */
  interface PgWindowClause extends PgNode {
    WindowClause: {
      /* window name (NULL in an OVER clause) */
      name?: string;
      /* referenced window name, if any */
      refname?: string;
      /* PARTITION BY list */
      partitionClause?: PgNode[];
      /* ORDER BY list */
      orderClause?: PgNode[];
      /* frame_clause options, see WindowDef */
      frameOptions: number;
      /* expression for starting bound, if any */
      startOffset?: PgNode;
      /* expression for ending bound, if any */
      endOffset?: PgNode;
      /* ID referenced by window functions */
      winref: number;
      /* did we copy orderClause from refname? */
      copiedOrder: boolean;
    }
  }
  /*
   * RowMarkClause -
   *	   parser output representation of FOR [KEY] UPDATE/SHARE clauses
   *
   * Query.rowMarks contains a separate RowMarkClause node for each relation
   * identified as a FOR [KEY] UPDATE/SHARE target.  If one of these clauses
   * is applied to a subquery, we generate RowMarkClauses for all normal and
   * subquery rels in the subquery, but they are marked pushedDown = true to
   * distinguish them from clauses that were explicitly written at this query
   * level.  Also, Query.hasForUpdate tells whether there were explicit FOR
   * UPDATE/SHARE/KEY SHARE clauses in the current query level.
   */
  interface PgRowMarkClause extends PgNode {
    RowMarkClause: {
      /* range table index of target relation */
      rti: number;
      /**/
      strength: PgLockClauseStrength;
      /* NOWAIT and SKIP LOCKED */
      waitPolicy: PgLockWaitPolicy;
      /* pushed down from higher query level? */
      pushedDown: boolean;
    }
  }
  /*
   * WithClause -
   *	   representation of WITH clause
   *
   * Note: WithClause does not propagate into the Query representation;
   * but CommonTableExpr does.
   */
  interface PgWithClause extends PgNode {
    WithClause: {
      /* list of CommonTableExprs */
      ctes?: PgNode[];
      /* true = WITH RECURSIVE */
      recursive: boolean;
      /* token location, or -1 if unknown */
      location: number;
    }
  }
  /*
   * InferClause -
   *		ON CONFLICT unique index inference clause
   *
   * Note: InferClause does not propagate into the Query representation.
   */
  interface PgInferClause extends PgNode {
    InferClause: {
      /* IndexElems to infer unique index */
      indexElems?: PgNode[];
      /* qualification (partial-index predicate) */
      whereClause?: PgNode;
      /* Constraint name, or NULL if unnamed */
      conname?: string;
      /* token location, or -1 if unknown */
      location: number;
    }
  }
  /*
   * OnConflictClause -
   *		representation of ON CONFLICT clause
   *
   * Note: OnConflictClause does not propagate into the Query representation.
   */
  interface PgOnConflictClause extends PgNode {
    OnConflictClause: {
      /* DO NOTHING or UPDATE? */
      action: PgOnConflictAction;
      /* Optional index inference clause */
      infer?: PgInferClause;
      /* the target list (of ResTarget) */
      targetList?: PgNode[];
      /* qualifications */
      whereClause?: PgNode;
      /* token location, or -1 if unknown */
      location: number;
    }
  }
  /*
   * CommonTableExpr -
   *	   representation of WITH list element
   *
   * We don't currently support the SEARCH or CYCLE clause.
   */
  interface PgCommonTableExpr extends PgNode {
    CommonTableExpr: {
      /* query name (never qualified) */
      ctename?: string;
      /* optional list of column names */
      aliascolnames?: PgNode[];
      /* the CTE's subquery */
      ctequery?: PgNode;
      /* token location, or -1 if unknown */
      location: number;
      /* is this CTE actually recursive? */
      cterecursive: boolean;
      /* number of RTEs referencing this CTE
      								 * (excluding internal self-references) */

      cterefcount: number;
      /* list of output column names */
      ctecolnames?: PgNode[];
      /* OID list of output column type OIDs */
      ctecoltypes?: PgNode[];
      /* integer list of output column typmods */
      ctecoltypmods?: PgNode[];
      /* OID list of column collation OIDs */
      ctecolcollations?: PgNode[];
    }
  }
  /* ----------------------
   *		Insert Statement
   *
   * The source expression is represented by SelectStmt for both the
   * SELECT and VALUES cases.  If selectStmt is NULL, then the query
   * is INSERT ... DEFAULT VALUES.
   * ----------------------
   */
  interface PgInsertStmt extends PgNode {
    InsertStmt: {
      /* relation to insert into */
      relation?: PgRangeVar;
      /* optional: names of the target columns */
      cols?: PgNode[];
      /* the source SELECT/VALUES, or NULL */
      selectStmt?: PgNode;
      /* ON CONFLICT clause */
      onConflictClause?: PgOnConflictClause;
      /* list of expressions to return */
      returningList?: PgNode[];
      /* WITH clause */
      withClause?: PgWithClause;
    }
  }
  /* ----------------------
   *		Delete Statement
   * ----------------------
   */
  interface PgDeleteStmt extends PgNode {
    DeleteStmt: {
      /* relation to delete from */
      relation?: PgRangeVar;
      /* optional using clause for more tables */
      usingClause?: PgNode[];
      /* qualifications */
      whereClause?: PgNode;
      /* list of expressions to return */
      returningList?: PgNode[];
      /* WITH clause */
      withClause?: PgWithClause;
    }
  }
  /* ----------------------
   *		Update Statement
   * ----------------------
   */
  interface PgUpdateStmt extends PgNode {
    UpdateStmt: {
      /* relation to update */
      relation?: PgRangeVar;
      /* the target list (of ResTarget) */
      targetList?: PgNode[];
      /* qualifications */
      whereClause?: PgNode;
      /* optional from clause for more tables */
      fromClause?: PgNode[];
      /* list of expressions to return */
      returningList?: PgNode[];
      /* WITH clause */
      withClause?: PgWithClause;
    }
  }
  /* ----------------------
   *		Select Statement
   *
   * A "simple" SELECT is represented in the output of gram.y by a single
   * SelectStmt node; so is a VALUES construct.  A query containing set
   * operators (UNION, INTERSECT, EXCEPT) is represented by a tree of SelectStmt
   * nodes, in which the leaf nodes are component SELECTs and the internal nodes
   * represent UNION, INTERSECT, or EXCEPT operators.  Using the same node
   * type for both leaf and internal nodes allows gram.y to stick ORDER BY,
   * LIMIT, etc, clause values into a SELECT statement without worrying
   * whether it is a simple or compound SELECT.
   * ----------------------
   */
  interface PgSelectStmt extends PgNode {
    SelectStmt: {
      /* NULL, list of DISTINCT ON exprs, or
      								 * lcons(NIL,NIL) for all (SELECT DISTINCT) */

      distinctClause?: PgNode[];
      /* target for SELECT INTO */
      intoClause?: PgIntoClause;
      /* the target list (of ResTarget) */
      targetList?: PgNode[];
      /* the FROM clause */
      fromClause?: PgNode[];
      /* WHERE qualification */
      whereClause?: PgNode;
      /* GROUP BY clauses */
      groupClause?: PgNode[];
      /* HAVING conditional-expression */
      havingClause?: PgNode;
      /* WINDOW window_name AS (...), ... */
      windowClause?: PgNode[];
      /* untransformed list of expression lists */
      valuesLists?: PgNode[][];
      /* sort clause (a list of SortBy's) */
      sortClause?: PgNode[];
      /* # of result tuples to skip */
      limitOffset?: PgNode;
      /* # of result tuples to return */
      limitCount?: PgNode;
      /* FOR UPDATE (list of LockingClause's) */
      lockingClause?: PgNode[];
      /* WITH clause */
      withClause?: PgWithClause;
      /* type of set op */
      op: PgSetOperation;
      /* ALL specified? */
      all: boolean;
      /* left child */
      larg?: PgSelectStmt;
      /* right child */
      rarg?: PgSelectStmt;
    }
  }
  /* ----------------------
   *		Set Operation node for post-analysis query trees
   *
   * After parse analysis, a SELECT with set operations is represented by a
   * top-level Query node containing the leaf SELECTs as subqueries in its
   * range table.  Its setOperations field shows the tree of set operations,
   * with leaf SelectStmt nodes replaced by RangeTblRef nodes, and internal
   * nodes replaced by SetOperationStmt nodes.  Information about the output
   * column types is added, too.  (Note that the child nodes do not necessarily
   * produce these types directly, but we've checked that their output types
   * can be coerced to the output column type.)  Also, if it's not UNION ALL,
   * information about the types' sort/group semantics is provided in the form
   * of a SortGroupClause list (same representation as, eg, DISTINCT).
   * The resolved common column collations are provided too; but note that if
   * it's not UNION ALL, it's okay for a column to not have a common collation,
   * so a member of the colCollations list could be InvalidOid even though the
   * column has a collatable type.
   * ----------------------
   */
  interface PgSetOperationStmt extends PgNode {
    SetOperationStmt: {
      /* type of set op */
      op: PgSetOperation;
      /* ALL specified? */
      all: boolean;
      /* left child */
      larg?: PgNode;
      /* right child */
      rarg?: PgNode;
      /* OID list of output column type OIDs */
      colTypes?: PgNode[];
      /* integer list of output column typmods */
      colTypmods?: PgNode[];
      /* OID list of output column collation OIDs */
      colCollations?: PgNode[];
      /* a list of SortGroupClause's */
      groupClauses?: PgNode[];
    }
  }
  /* ----------------------
   *		Create Schema Statement
   *
   * NOTE: the schemaElts list contains raw parsetrees for component statements
   * of the schema, such as CREATE TABLE, GRANT, etc.  These are analyzed and
   * executed after the schema itself is created.
   * ----------------------
   */
  interface PgCreateSchemaStmt extends PgNode {
    CreateSchemaStmt: {
      /* the name of the schema to create */
      schemaname?: string;
      /* the owner of the created schema */
      authrole?: PgNode;
      /* schema components (list of parsenodes) */
      schemaElts?: PgNode[];
      /* just do nothing if schema already exists? */
      if_not_exists: boolean;
    }
  }
  /* ----------------------
   *	Alter Table
   * ----------------------
   */
  interface PgAlterTableStmt extends PgNode {
    AlterTableStmt: {
      /* table to work on */
      relation?: PgRangeVar;
      /* list of subcommands */
      cmds?: PgNode[];
      /* type of object */
      relkind: PgObjectType;
      /* skip error if table missing */
      missing_ok: boolean;
    }
  }
  /* ----------------------
   *	Alter Table
   * ----------------------
   */
  interface PgReplicaIdentityStmt extends PgNode {
    ReplicaIdentityStmt: {
      /**/
      identity_type: string;
      /**/
      name?: string;
    }
  }
  /* ----------------------
   *	Alter Table
   * ----------------------
   */
  interface PgAlterTableCmd extends PgNode {
    AlterTableCmd: {
      /* Type of table alteration to apply */
      subtype: PgAlterTableType;
      /* column, constraint, or trigger to act on,
      								 * or tablespace */

      name?: string;
      /* RoleSpec */
      newowner?: PgNode;
      /* definition of new column, index,
      								 * constraint, or parent table */

      def?: PgNode;
      /* RESTRICT or CASCADE for DROP cases */
      behavior: PgDropBehavior;
      /* skip error if missing? */
      missing_ok: boolean;
    }
  }
  /* ----------------------
   *	Alter Domain
   *
   * The fields are used in different ways by the different variants of
   * this command.
   * ----------------------
   */
  interface PgAlterDomainStmt extends PgNode {
    AlterDomainStmt: {
      /*------------
      								 *	T = alter column default
      								 *	N = alter column drop not null
      								 *	O = alter column set not null
      								 *	C = add constraint
      								 *	X = drop constraint
      								 *------------
      								 */

      subtype: string;
      /* domain to work on */
      typeName?: PgNode[];
      /* column or constraint name to act on */
      name?: string;
      /* definition of default or constraint */
      def?: PgNode;
      /* RESTRICT or CASCADE for DROP cases */
      behavior: PgDropBehavior;
      /* skip error if missing? */
      missing_ok: boolean;
    }
  }
  /* ----------------------
   *		Grant|Revoke Statement
   * ----------------------
   */
  interface PgGrantStmt extends PgNode {
    GrantStmt: {
      /* true = GRANT, false = REVOKE */
      is_grant: boolean;
      /* type of the grant target */
      targtype: PgGrantTargetType;
      /* kind of object being operated on */
      objtype: PgGrantObjectType;
      /* list of RangeVar nodes, FuncWithArgs nodes,
      								 * or plain names (as Value strings) */

      objects?: PgNode[];
      /* list of AccessPriv nodes */
      privileges?: PgNode[];
      /* list of RoleSpec nodes */
      grantees?: PgNode[];
      /* grant or revoke grant option */
      grant_option: boolean;
      /* drop behavior (for REVOKE) */
      behavior: PgDropBehavior;
    }
  }
  /*
   * Note: FuncWithArgs carries only the types of the input parameters of the
   * function.  So it is sufficient to identify an existing function, but it
   * is not enough info to define a function nor to call it.
   */
  interface PgFuncWithArgs extends PgNode {
    FuncWithArgs: {
      /* qualified name of function */
      funcname?: PgNode[];
      /* list of Typename nodes */
      funcargs?: PgNode[];
    }
  }
  /*
   * An access privilege, with optional list of column names
   * priv_name == NULL denotes ALL PRIVILEGES (only used with a column list)
   * cols == NIL denotes "all columns"
   * Note that simple "ALL PRIVILEGES" is represented as a NIL list, not
   * an AccessPriv with both fields null.
   */
  interface PgAccessPriv extends PgNode {
    AccessPriv: {
      /* string name of privilege */
      priv_name?: string;
      /* list of Value strings */
      cols?: PgNode[];
    }
  }
  /* ----------------------
   *		Grant/Revoke Role Statement
   *
   * Note: because of the parsing ambiguity with the GRANT <privileges>
   * statement, granted_roles is a list of AccessPriv; the execution code
   * should complain if any column lists appear.  grantee_roles is a list
   * of role names, as Value strings.
   * ----------------------
   */
  interface PgGrantRoleStmt extends PgNode {
    GrantRoleStmt: {
      /* list of roles to be granted/revoked */
      granted_roles?: PgNode[];
      /* list of member roles to add/delete */
      grantee_roles?: PgNode[];
      /* true = GRANT, false = REVOKE */
      is_grant: boolean;
      /* with admin option */
      admin_opt: boolean;
      /* set grantor to other than current role */
      grantor?: PgNode;
      /* drop behavior (for REVOKE) */
      behavior: PgDropBehavior;
    }
  }
  /* ----------------------
   *	Alter Default Privileges Statement
   * ----------------------
   */
  interface PgAlterDefaultPrivilegesStmt extends PgNode {
    AlterDefaultPrivilegesStmt: {
      /* list of DefElem */
      options?: PgNode[];
      /* GRANT/REVOKE action (with objects=NIL) */
      action?: PgGrantStmt;
    }
  }
  /* ----------------------
   *		Copy Statement
   *
   * We support "COPY relation FROM file", "COPY relation TO file", and
   * "COPY (query) TO file".  In any given CopyStmt, exactly one of "relation"
   * and "query" must be non-NULL.
   * ----------------------
   */
  interface PgCopyStmt extends PgNode {
    CopyStmt: {
      /* the relation to copy */
      relation?: PgRangeVar;
      /* the SELECT query to copy */
      query?: PgNode;
      /* List of column names (as Strings), or NIL
      								 * for all columns */

      attlist?: PgNode[];
      /* TO or FROM */
      is_from: boolean;
      /* is 'filename' a program to popen? */
      is_program: boolean;
      /* filename, or NULL for STDIN/STDOUT */
      filename?: string;
      /* List of DefElem nodes */
      options?: PgNode[];
    }
  }
  /**/
  interface PgVariableSetStmt extends PgNode {
    VariableSetStmt: {
      /**/
      kind: PgVariableSetKind;
      /* variable to be set */
      name?: string;
      /* List of A_Const nodes */
      args?: PgNode[];
      /* SET LOCAL? */
      is_local: boolean;
    }
  }
  /* ----------------------
   * Show Statement
   * ----------------------
   */
  interface PgVariableShowStmt extends PgNode {
    VariableShowStmt: {
      /**/
      name?: string;
    }
  }
  /* ----------------------
   *		Create Table Statement
   *
   * NOTE: in the raw gram.y output, ColumnDef and Constraint nodes are
   * intermixed in tableElts, and constraints is NIL.  After parse analysis,
   * tableElts contains just ColumnDefs, and constraints contains just
   * Constraint nodes (in fact, only CONSTR_CHECK nodes, in the present
   * implementation).
   * ----------------------
   */
  interface PgCreateStmt extends PgNode {
    CreateStmt: {
      /* relation to create */
      relation?: PgRangeVar;
      /* column definitions (list of ColumnDef) */
      tableElts?: PgNode[];
      /* relations to inherit from (list of
      								 * inhRelation) */

      inhRelations?: PgNode[];
      /* OF typename */
      ofTypename?: PgTypeName;
      /* constraints (list of Constraint nodes) */
      constraints?: PgNode[];
      /* options from WITH clause */
      options?: PgNode[];
      /* what do we do at COMMIT? */
      oncommit: PgOnCommitAction;
      /* table space to use, or NULL */
      tablespacename?: string;
      /* just do nothing if it already exists? */
      if_not_exists: boolean;
    }
  }
  /* Foreign key matchtype codes */
  interface PgConstraint extends PgNode {
    Constraint: {
      /* see above */
      contype: PgConstrType;
      /* Constraint name, or NULL if unnamed */
      conname?: string;
      /* DEFERRABLE? */
      deferrable: boolean;
      /* INITIALLY DEFERRED? */
      initdeferred: boolean;
      /* token location, or -1 if unknown */
      location: number;
      /* is constraint non-inheritable? */
      is_no_inherit: boolean;
      /* expr, as untransformed parse tree */
      raw_expr?: PgNode;
      /* expr, as nodeToString representation */
      cooked_expr?: string;
      /* String nodes naming referenced column(s) */
      keys?: PgNode[];
      /* list of (IndexElem, operator name) pairs */
      exclusions?: PgNode[];
      /* options from WITH clause */
      options?: PgNode[];
      /* existing index to use; otherwise NULL */
      indexname?: string;
      /* index tablespace; NULL for default */
      indexspace?: string;
      /* index access method; NULL for default */
      access_method?: string;
      /* partial index predicate */
      where_clause?: PgNode;
      /* Primary key table */
      pktable?: PgRangeVar;
      /* Attributes of foreign key */
      fk_attrs?: PgNode[];
      /* Corresponding attrs in PK table */
      pk_attrs?: PgNode[];
      /* FULL, PARTIAL, SIMPLE */
      fk_matchtype: string;
      /* ON UPDATE action */
      fk_upd_action: string;
      /* ON DELETE action */
      fk_del_action: string;
      /* pg_constraint.conpfeqop of my former self */
      old_conpfeqop?: PgNode[];
      /* pg_constraint.confrelid of my former self */
      old_pktable_oid: number;
      /* skip validation of existing rows? */
      skip_validation: boolean;
      /* mark the new constraint as valid? */
      initially_valid: boolean;
    }
  }
  /* ----------------------
   *		Create/Drop Table Space Statements
   * ----------------------
   */
  interface PgCreateTableSpaceStmt extends PgNode {
    CreateTableSpaceStmt: {
      /**/
      tablespacename?: string;
      /**/
      owner?: PgNode;
      /**/
      location?: string;
      /**/
      options?: PgNode[];
    }
  }
  /* ----------------------
   *		Create/Drop Table Space Statements
   * ----------------------
   */
  interface PgDropTableSpaceStmt extends PgNode {
    DropTableSpaceStmt: {
      /**/
      tablespacename?: string;
      /* skip error if missing? */
      missing_ok: boolean;
    }
  }
  /**/
  interface PgAlterTableSpaceOptionsStmt extends PgNode {
    AlterTableSpaceOptionsStmt: {
      /**/
      tablespacename?: string;
      /**/
      options?: PgNode[];
      /**/
      isReset: boolean;
    }
  }
  /**/
  interface PgAlterTableMoveAllStmt extends PgNode {
    AlterTableMoveAllStmt: {
      /**/
      orig_tablespacename?: string;
      /* Object type to move */
      objtype: PgObjectType;
      /* List of roles to move objects of */
      roles?: PgNode[];
      /**/
      new_tablespacename?: string;
      /**/
      nowait: boolean;
    }
  }
  /* ----------------------
   *		Create/Alter Extension Statements
   * ----------------------
   */
  interface PgCreateExtensionStmt extends PgNode {
    CreateExtensionStmt: {
      /**/
      extname?: string;
      /* just do nothing if it already exists? */
      if_not_exists: boolean;
      /* List of DefElem nodes */
      options?: PgNode[];
    }
  }
  /* Only used for ALTER EXTENSION UPDATE; later might need an action field */
  interface PgAlterExtensionStmt extends PgNode {
    AlterExtensionStmt: {
      /**/
      extname?: string;
      /* List of DefElem nodes */
      options?: PgNode[];
    }
  }
  /* ----------------------
   *		Create/Alter Extension Statements
   * ----------------------
   */
  interface PgAlterExtensionContentsStmt extends PgNode {
    AlterExtensionContentsStmt: {
      /* Extension's name */
      extname?: string;
      /* +1 = add object, -1 = drop object */
      action: number;
      /* Object's type */
      objtype: PgObjectType;
      /* Qualified name of the object */
      objname?: PgNode[];
      /* Arguments if needed (eg, for functions) */
      objargs?: PgNode[];
    }
  }
  /* ----------------------
   *		Create/Alter FOREIGN DATA WRAPPER Statements
   * ----------------------
   */
  interface PgCreateFdwStmt extends PgNode {
    CreateFdwStmt: {
      /* foreign-data wrapper name */
      fdwname?: string;
      /* HANDLER/VALIDATOR options */
      func_options?: PgNode[];
      /* generic options to FDW */
      options?: PgNode[];
    }
  }
  /* ----------------------
   *		Create/Alter FOREIGN DATA WRAPPER Statements
   * ----------------------
   */
  interface PgAlterFdwStmt extends PgNode {
    AlterFdwStmt: {
      /* foreign-data wrapper name */
      fdwname?: string;
      /* HANDLER/VALIDATOR options */
      func_options?: PgNode[];
      /* generic options to FDW */
      options?: PgNode[];
    }
  }
  /* ----------------------
   *		Create/Alter FOREIGN SERVER Statements
   * ----------------------
   */
  interface PgCreateForeignServerStmt extends PgNode {
    CreateForeignServerStmt: {
      /* server name */
      servername?: string;
      /* optional server type */
      servertype?: string;
      /* optional server version */
      version?: string;
      /* FDW name */
      fdwname?: string;
      /* generic options to server */
      options?: PgNode[];
    }
  }
  /* ----------------------
   *		Create/Alter FOREIGN SERVER Statements
   * ----------------------
   */
  interface PgAlterForeignServerStmt extends PgNode {
    AlterForeignServerStmt: {
      /* server name */
      servername?: string;
      /* optional server version */
      version?: string;
      /* generic options to server */
      options?: PgNode[];
      /* version specified */
      has_version: boolean;
    }
  }
  /* ----------------------
   *		Create FOREIGN TABLE Statement
   * ----------------------
   */
  interface PgCreateForeignTableStmt extends PgNode {
    CreateForeignTableStmt: {
      /**/
      base: PgCreateStmt;
      /**/
      servername?: string;
      /**/
      options?: PgNode[];
    }
  }
  /* ----------------------
   *		Create/Drop USER MAPPING Statements
   * ----------------------
   */
  interface PgCreateUserMappingStmt extends PgNode {
    CreateUserMappingStmt: {
      /* user role */
      user?: PgNode;
      /* server name */
      servername?: string;
      /* generic options to server */
      options?: PgNode[];
    }
  }
  /* ----------------------
   *		Create/Drop USER MAPPING Statements
   * ----------------------
   */
  interface PgAlterUserMappingStmt extends PgNode {
    AlterUserMappingStmt: {
      /* user role */
      user?: PgNode;
      /* server name */
      servername?: string;
      /* generic options to server */
      options?: PgNode[];
    }
  }
  /* ----------------------
   *		Create/Drop USER MAPPING Statements
   * ----------------------
   */
  interface PgDropUserMappingStmt extends PgNode {
    DropUserMappingStmt: {
      /* user role */
      user?: PgNode;
      /* server name */
      servername?: string;
      /* ignore missing mappings */
      missing_ok: boolean;
    }
  }
  /**/
  interface PgImportForeignSchemaStmt extends PgNode {
    ImportForeignSchemaStmt: {
      /* FDW server name */
      server_name?: string;
      /* remote schema name to query */
      remote_schema?: string;
      /* local schema to create objects in */
      local_schema?: string;
      /* type of table list */
      list_type: PgImportForeignSchemaType;
      /* List of RangeVar */
      table_list?: PgNode[];
      /* list of options to pass to FDW */
      options?: PgNode[];
    }
  }
  /*----------------------
   *		Create POLICY Statement
   *----------------------
   */
  interface PgCreatePolicyStmt extends PgNode {
    CreatePolicyStmt: {
      /* Policy's name */
      policy_name?: string;
      /* the table name the policy applies to */
      table?: PgRangeVar;
      /* the command name the policy applies to */
      cmd_name?: string;
      /* the roles associated with the policy */
      roles?: PgNode[];
      /* the policy's condition */
      qual?: PgNode;
      /* the policy's WITH CHECK condition. */
      with_check?: PgNode;
    }
  }
  /*----------------------
   *		Alter POLICY Statement
   *----------------------
   */
  interface PgAlterPolicyStmt extends PgNode {
    AlterPolicyStmt: {
      /* Policy's name */
      policy_name?: string;
      /* the table name the policy applies to */
      table?: PgRangeVar;
      /* the roles associated with the policy */
      roles?: PgNode[];
      /* the policy's condition */
      qual?: PgNode;
      /* the policy's WITH CHECK condition. */
      with_check?: PgNode;
    }
  }
  /* ----------------------
   *		Create TRIGGER Statement
   * ----------------------
   */
  interface PgCreateTrigStmt extends PgNode {
    CreateTrigStmt: {
      /* TRIGGER's name */
      trigname?: string;
      /* relation trigger is on */
      relation?: PgRangeVar;
      /* qual. name of function to call */
      funcname?: PgNode[];
      /* list of (T_String) Values or NIL */
      args?: PgNode[];
      /* ROW/STATEMENT */
      row: boolean;
      /* BEFORE, AFTER, or INSTEAD */
      timing: number;
      /* "OR" of INSERT/UPDATE/DELETE/TRUNCATE */
      events: number;
      /* column names, or NIL for all columns */
      columns?: PgNode[];
      /* qual expression, or NULL if none */
      whenClause?: PgNode;
      /* This is a constraint trigger */
      isconstraint: boolean;
      /* [NOT] DEFERRABLE */
      deferrable: boolean;
      /* INITIALLY {DEFERRED|IMMEDIATE} */
      initdeferred: boolean;
      /* opposite relation, if RI trigger */
      constrrel?: PgRangeVar;
    }
  }
  /* ----------------------
   *		Create EVENT TRIGGER Statement
   * ----------------------
   */
  interface PgCreateEventTrigStmt extends PgNode {
    CreateEventTrigStmt: {
      /* TRIGGER's name */
      trigname?: string;
      /* event's identifier */
      eventname?: string;
      /* list of DefElems indicating filtering */
      whenclause?: PgNode[];
      /* qual. name of function to call */
      funcname?: PgNode[];
    }
  }
  /* ----------------------
   *		Alter EVENT TRIGGER Statement
   * ----------------------
   */
  interface PgAlterEventTrigStmt extends PgNode {
    AlterEventTrigStmt: {
      /* TRIGGER's name */
      trigname?: string;
      /* trigger's firing configuration WRT
      								 * session_replication_role */

      tgenabled: string;
    }
  }
  /* ----------------------
   *		Create/Drop PROCEDURAL LANGUAGE Statements
   *		Create PROCEDURAL LANGUAGE Statements
   * ----------------------
   */
  interface PgCreatePLangStmt extends PgNode {
    CreatePLangStmt: {
      /* T => replace if already exists */
      replace: boolean;
      /* PL name */
      plname?: string;
      /* PL call handler function (qual. name) */
      plhandler?: PgNode[];
      /* optional inline function (qual. name) */
      plinline?: PgNode[];
      /* optional validator function (qual. name) */
      plvalidator?: PgNode[];
      /* PL is trusted */
      pltrusted: boolean;
    }
  }
  /* ----------------------
   *	Create/Alter/Drop Role Statements
   *
   * Note: these node types are also used for the backwards-compatible
   * Create/Alter/Drop User/Group statements.  In the ALTER and DROP cases
   * there's really no need to distinguish what the original spelling was,
   * but for CREATE we mark the type because the defaults vary.
   * ----------------------
   */
  interface PgCreateRoleStmt extends PgNode {
    CreateRoleStmt: {
      /* ROLE/USER/GROUP */
      stmt_type: PgRoleStmtType;
      /* role name */
      role?: string;
      /* List of DefElem nodes */
      options?: PgNode[];
    }
  }
  /* ----------------------
   *	Create/Alter/Drop Role Statements
   *
   * Note: these node types are also used for the backwards-compatible
   * Create/Alter/Drop User/Group statements.  In the ALTER and DROP cases
   * there's really no need to distinguish what the original spelling was,
   * but for CREATE we mark the type because the defaults vary.
   * ----------------------
   */
  interface PgAlterRoleStmt extends PgNode {
    AlterRoleStmt: {
      /* role */
      role?: PgNode;
      /* List of DefElem nodes */
      options?: PgNode[];
      /* +1 = add members, -1 = drop members */
      action: number;
    }
  }
  /* ----------------------
   *	Create/Alter/Drop Role Statements
   *
   * Note: these node types are also used for the backwards-compatible
   * Create/Alter/Drop User/Group statements.  In the ALTER and DROP cases
   * there's really no need to distinguish what the original spelling was,
   * but for CREATE we mark the type because the defaults vary.
   * ----------------------
   */
  interface PgAlterRoleSetStmt extends PgNode {
    AlterRoleSetStmt: {
      /* role */
      role?: PgNode;
      /* database name, or NULL */
      database?: string;
      /* SET or RESET subcommand */
      setstmt?: PgVariableSetStmt;
    }
  }
  /* ----------------------
   *	Create/Alter/Drop Role Statements
   *
   * Note: these node types are also used for the backwards-compatible
   * Create/Alter/Drop User/Group statements.  In the ALTER and DROP cases
   * there's really no need to distinguish what the original spelling was,
   * but for CREATE we mark the type because the defaults vary.
   * ----------------------
   */
  interface PgDropRoleStmt extends PgNode {
    DropRoleStmt: {
      /* List of roles to remove */
      roles?: PgNode[];
      /* skip error if a role is missing? */
      missing_ok: boolean;
    }
  }
  /* ----------------------
   *		{Create|Alter} SEQUENCE Statement
   * ----------------------
   */
  interface PgCreateSeqStmt extends PgNode {
    CreateSeqStmt: {
      /* the sequence to create */
      sequence?: PgRangeVar;
      /**/
      options?: PgNode[];
      /* ID of owner, or InvalidOid for default */
      ownerId: number;
      /* just do nothing if it already exists? */
      if_not_exists: boolean;
    }
  }
  /* ----------------------
   *		{Create|Alter} SEQUENCE Statement
   * ----------------------
   */
  interface PgAlterSeqStmt extends PgNode {
    AlterSeqStmt: {
      /* the sequence to alter */
      sequence?: PgRangeVar;
      /**/
      options?: PgNode[];
      /* skip error if a role is missing? */
      missing_ok: boolean;
    }
  }
  /* ----------------------
   *		Create {Aggregate|Operator|Type} Statement
   * ----------------------
   */
  interface PgDefineStmt extends PgNode {
    DefineStmt: {
      /* aggregate, operator, type */
      kind: PgObjectType;
      /* hack to signal old CREATE AGG syntax */
      oldstyle: boolean;
      /* qualified name (list of Value strings) */
      defnames?: PgNode[];
      /* a list of TypeName (if needed) */
      args?: PgNode[];
      /* a list of DefElem */
      definition?: PgNode[];
    }
  }
  /* ----------------------
   *		Create Domain Statement
   * ----------------------
   */
  interface PgCreateDomainStmt extends PgNode {
    CreateDomainStmt: {
      /* qualified name (list of Value strings) */
      domainname?: PgNode[];
      /* the base type */
      typeName?: PgTypeName;
      /* untransformed COLLATE spec, if any */
      collClause?: PgCollateClause;
      /* constraints (list of Constraint nodes) */
      constraints?: PgNode[];
    }
  }
  /* ----------------------
   *		Create Operator Class Statement
   * ----------------------
   */
  interface PgCreateOpClassStmt extends PgNode {
    CreateOpClassStmt: {
      /* qualified name (list of Value strings) */
      opclassname?: PgNode[];
      /* qualified name (ditto); NIL if omitted */
      opfamilyname?: PgNode[];
      /* name of index AM opclass is for */
      amname?: string;
      /* datatype of indexed column */
      datatype?: PgTypeName;
      /* List of CreateOpClassItem nodes */
      items?: PgNode[];
      /* Should be marked as default for type? */
      isDefault: boolean;
    }
  }
  /* ----------------------
   *		Create Operator Class Statement
   * ----------------------
   */
  interface PgCreateOpClassItem extends PgNode {
    CreateOpClassItem: {
      /* see codes above */
      itemtype: number;
      /* operator or function name */
      name?: PgNode[];
      /* argument types */
      args?: PgNode[];
      /* strategy num or support proc num */
      number: number;
      /* only used for ordering operators */
      order_family?: PgNode[];
      /* only used for functions */
      class_args?: PgNode[];
      /* datatype stored in index */
      storedtype?: PgTypeName;
    }
  }
  /* ----------------------
   *		Create Operator Family Statement
   * ----------------------
   */
  interface PgCreateOpFamilyStmt extends PgNode {
    CreateOpFamilyStmt: {
      /* qualified name (list of Value strings) */
      opfamilyname?: PgNode[];
      /* name of index AM opfamily is for */
      amname?: string;
    }
  }
  /* ----------------------
   *		Alter Operator Family Statement
   * ----------------------
   */
  interface PgAlterOpFamilyStmt extends PgNode {
    AlterOpFamilyStmt: {
      /* qualified name (list of Value strings) */
      opfamilyname?: PgNode[];
      /* name of index AM opfamily is for */
      amname?: string;
      /* ADD or DROP the items? */
      isDrop: boolean;
      /* List of CreateOpClassItem nodes */
      items?: PgNode[];
    }
  }
  /* ----------------------
   *		Drop Table|Sequence|View|Index|Type|Domain|Conversion|Schema Statement
   * ----------------------
   */
  interface PgDropStmt extends PgNode {
    DropStmt: {
      /* list of sublists of names (as Values) */
      objects?: PgNode[];
      /* list of sublists of arguments (as Values) */
      arguments?: PgNode[];
      /* object type */
      removeType: PgObjectType;
      /* RESTRICT or CASCADE behavior */
      behavior: PgDropBehavior;
      /* skip error if object is missing? */
      missing_ok: boolean;
      /* drop index concurrently? */
      concurrent: boolean;
    }
  }
  /* ----------------------
   *				Truncate Table Statement
   * ----------------------
   */
  interface PgTruncateStmt extends PgNode {
    TruncateStmt: {
      /* relations (RangeVars) to be truncated */
      relations?: PgNode[];
      /* restart owned sequences? */
      restart_seqs: boolean;
      /* RESTRICT or CASCADE behavior */
      behavior: PgDropBehavior;
    }
  }
  /* ----------------------
   *				Comment On Statement
   * ----------------------
   */
  interface PgCommentStmt extends PgNode {
    CommentStmt: {
      /* Object's type */
      objtype: PgObjectType;
      /* Qualified name of the object */
      objname?: PgNode[];
      /* Arguments if needed (eg, for functions) */
      objargs?: PgNode[];
      /* Comment to insert, or NULL to remove */
      comment?: string;
    }
  }
  /* ----------------------
   *				SECURITY LABEL Statement
   * ----------------------
   */
  interface PgSecLabelStmt extends PgNode {
    SecLabelStmt: {
      /* Object's type */
      objtype: PgObjectType;
      /* Qualified name of the object */
      objname?: PgNode[];
      /* Arguments if needed (eg, for functions) */
      objargs?: PgNode[];
      /* Label provider (or NULL) */
      provider?: string;
      /* New security label to be assigned */
      label?: string;
    }
  }
  /* these planner-control flags do not correspond to any SQL grammar: */
  interface PgDeclareCursorStmt extends PgNode {
    DeclareCursorStmt: {
      /* name of the portal (cursor) */
      portalname?: string;
      /* bitmask of options (see above) */
      options: number;
      /* the raw SELECT query */
      query?: PgNode;
    }
  }
  /* ----------------------
   *		Close Portal Statement
   * ----------------------
   */
  interface PgClosePortalStmt extends PgNode {
    ClosePortalStmt: {
      /* name of the portal (cursor) */
      portalname?: string;
    }
  }
  /* ----------------------
   *		Fetch Statement (also Move)
   * ----------------------
   */
  interface PgFetchStmt extends PgNode {
    FetchStmt: {
      /* see above */
      direction: PgFetchDirection;
      /* number of rows, or position argument */
      howMany: number;
      /* name of portal (cursor) */
      portalname?: string;
      /* TRUE if MOVE */
      ismove: boolean;
    }
  }
  /* ----------------------
   *		Create Index Statement
   *
   * This represents creation of an index and/or an associated constraint.
   * If isconstraint is true, we should create a pg_constraint entry along
   * with the index.  But if indexOid isn't InvalidOid, we are not creating an
   * index, just a UNIQUE/PKEY constraint using an existing index.  isconstraint
   * must always be true in this case, and the fields describing the index
   * properties are empty.
   * ----------------------
   */
  interface PgIndexStmt extends PgNode {
    IndexStmt: {
      /* name of new index, or NULL for default */
      idxname?: string;
      /* relation to build index on */
      relation?: PgRangeVar;
      /* name of access method (eg. btree) */
      accessMethod?: string;
      /* tablespace, or NULL for default */
      tableSpace?: string;
      /* columns to index: a list of IndexElem */
      indexParams?: PgNode[];
      /* WITH clause options: a list of DefElem */
      options?: PgNode[];
      /* qualification (partial-index predicate) */
      whereClause?: PgNode;
      /* exclusion operator names, or NIL if none */
      excludeOpNames?: PgNode[];
      /* comment to apply to index, or NULL */
      idxcomment?: string;
      /* OID of an existing index, if any */
      indexOid: number;
      /* relfilenode of existing storage, if any */
      oldNode: number;
      /* is index unique? */
      unique: boolean;
      /* is index a primary key? */
      primary: boolean;
      /* is it for a pkey/unique constraint? */
      isconstraint: boolean;
      /* is the constraint DEFERRABLE? */
      deferrable: boolean;
      /* is the constraint INITIALLY DEFERRED? */
      initdeferred: boolean;
      /* true when transformIndexStmt is finished */
      transformed: boolean;
      /* should this be a concurrent index build? */
      concurrent: boolean;
      /* just do nothing if index already exists? */
      if_not_exists: boolean;
    }
  }
  /* ----------------------
   *		Create Function Statement
   * ----------------------
   */
  interface PgCreateFunctionStmt extends PgNode {
    CreateFunctionStmt: {
      /* T => replace if already exists */
      replace: boolean;
      /* qualified name of function to create */
      funcname?: PgNode[];
      /* a list of FunctionParameter */
      parameters?: PgNode[];
      /* the return type */
      returnType?: PgTypeName;
      /* a list of DefElem */
      options?: PgNode[];
      /* a list of DefElem */
      withClause?: PgNode[];
    }
  }
  /* ----------------------
   *		Create Function Statement
   * ----------------------
   */
  interface PgFunctionParameter extends PgNode {
    FunctionParameter: {
      /* parameter name, or NULL if not given */
      name?: string;
      /* TypeName for parameter type */
      argType?: PgTypeName;
      /* IN/OUT/etc */
      mode: PgFunctionParameterMode;
      /* raw default expr, or NULL if not given */
      defexpr?: PgNode;
    }
  }
  /* ----------------------
   *		Create Function Statement
   * ----------------------
   */
  interface PgAlterFunctionStmt extends PgNode {
    AlterFunctionStmt: {
      /* name and args of function */
      func?: PgFuncWithArgs;
      /* list of DefElem */
      actions?: PgNode[];
    }
  }
  /* ----------------------
   *		DO Statement
   *
   * DoStmt is the raw parser output, InlineCodeBlock is the execution-time API
   * ----------------------
   */
  interface PgDoStmt extends PgNode {
    DoStmt: {
      /* List of DefElem nodes */
      args?: PgNode[];
    }
  }
  /* ----------------------
   *		DO Statement
   *
   * DoStmt is the raw parser output, InlineCodeBlock is the execution-time API
   * ----------------------
   */
  interface PgInlineCodeBlock extends PgNode {
    InlineCodeBlock: {
      /* source text of anonymous code block */
      source_text?: string;
      /* OID of selected language */
      langOid: number;
      /* trusted property of the language */
      langIsTrusted: boolean;
    }
  }
  /* ----------------------
   *		Alter Object Rename Statement
   * ----------------------
   */
  interface PgRenameStmt extends PgNode {
    RenameStmt: {
      /* OBJECT_TABLE, OBJECT_COLUMN, etc */
      renameType: PgObjectType;
      /* if column name, associated relation type */
      relationType: PgObjectType;
      /* in case it's a table */
      relation?: PgRangeVar;
      /* in case it's some other object */
      object?: PgNode[];
      /* argument types, if applicable */
      objarg?: PgNode[];
      /* name of contained object (column, rule,
      								 * trigger, etc) */

      subname?: string;
      /* the new name */
      newname?: string;
      /* RESTRICT or CASCADE behavior */
      behavior: PgDropBehavior;
      /* skip error if missing? */
      missing_ok: boolean;
    }
  }
  /* ----------------------
   *		ALTER object SET SCHEMA Statement
   * ----------------------
   */
  interface PgAlterObjectSchemaStmt extends PgNode {
    AlterObjectSchemaStmt: {
      /* OBJECT_TABLE, OBJECT_TYPE, etc */
      objectType: PgObjectType;
      /* in case it's a table */
      relation?: PgRangeVar;
      /* in case it's some other object */
      object?: PgNode[];
      /* argument types, if applicable */
      objarg?: PgNode[];
      /* the new schema */
      newschema?: string;
      /* skip error if missing? */
      missing_ok: boolean;
    }
  }
  /* ----------------------
   *		Alter Object Owner Statement
   * ----------------------
   */
  interface PgAlterOwnerStmt extends PgNode {
    AlterOwnerStmt: {
      /* OBJECT_TABLE, OBJECT_TYPE, etc */
      objectType: PgObjectType;
      /* in case it's a table */
      relation?: PgRangeVar;
      /* in case it's some other object */
      object?: PgNode[];
      /* argument types, if applicable */
      objarg?: PgNode[];
      /* the new owner */
      newowner?: PgNode;
    }
  }
  /* ----------------------
   *		Create Rule Statement
   * ----------------------
   */
  interface PgRuleStmt extends PgNode {
    RuleStmt: {
      /* relation the rule is for */
      relation?: PgRangeVar;
      /* name of the rule */
      rulename?: string;
      /* qualifications */
      whereClause?: PgNode;
      /* SELECT, INSERT, etc */
      event: PgCmdType;
      /* is a 'do instead'? */
      instead: boolean;
      /* the action statements */
      actions?: PgNode[];
      /* OR REPLACE */
      replace: boolean;
    }
  }
  /* ----------------------
   *		Notify Statement
   * ----------------------
   */
  interface PgNotifyStmt extends PgNode {
    NotifyStmt: {
      /* condition name to notify */
      conditionname?: string;
      /* the payload string, or NULL if none */
      payload?: string;
    }
  }
  /* ----------------------
   *		Listen Statement
   * ----------------------
   */
  interface PgListenStmt extends PgNode {
    ListenStmt: {
      /* condition name to listen on */
      conditionname?: string;
    }
  }
  /* ----------------------
   *		Unlisten Statement
   * ----------------------
   */
  interface PgUnlistenStmt extends PgNode {
    UnlistenStmt: {
      /* name to unlisten on, or NULL for all */
      conditionname?: string;
    }
  }
  /* ----------------------
   *		{Begin|Commit|Rollback} Transaction Statement
   * ----------------------
   */
  interface PgTransactionStmt extends PgNode {
    TransactionStmt: {
      /* see above */
      kind: PgTransactionStmtKind;
      /* for BEGIN/START and savepoint commands */
      options?: PgNode[];
      /* for two-phase-commit related commands */
      gid?: string;
    }
  }
  /* ----------------------
   *		Create Type Statement, composite types
   * ----------------------
   */
  interface PgCompositeTypeStmt extends PgNode {
    CompositeTypeStmt: {
      /* the composite type to be created */
      typevar?: PgRangeVar;
      /* list of ColumnDef nodes */
      coldeflist?: PgNode[];
    }
  }
  /* ----------------------
   *		Create Type Statement, enum types
   * ----------------------
   */
  interface PgCreateEnumStmt extends PgNode {
    CreateEnumStmt: {
      /* qualified name (list of Value strings) */
      typeName?: PgNode[];
      /* enum values (list of Value strings) */
      vals?: PgNode[];
    }
  }
  /* ----------------------
   *		Create Type Statement, range types
   * ----------------------
   */
  interface PgCreateRangeStmt extends PgNode {
    CreateRangeStmt: {
      /* qualified name (list of Value strings) */
      typeName?: PgNode[];
      /* range parameters (list of DefElem) */
      params?: PgNode[];
    }
  }
  /* ----------------------
   *		Alter Type Statement, enum types
   * ----------------------
   */
  interface PgAlterEnumStmt extends PgNode {
    AlterEnumStmt: {
      /* qualified name (list of Value strings) */
      typeName?: PgNode[];
      /* new enum value's name */
      newVal?: string;
      /* neighboring enum value, if specified */
      newValNeighbor?: string;
      /* place new enum value after neighbor? */
      newValIsAfter: boolean;
      /* no error if label already exists */
      skipIfExists: boolean;
    }
  }
  /* ----------------------
   *		Create View Statement
   * ----------------------
   */
  interface PgViewStmt extends PgNode {
    ViewStmt: {
      /* the view to be created */
      view?: PgRangeVar;
      /* target column names */
      aliases?: PgNode[];
      /* the SELECT query */
      query?: PgNode;
      /* replace an existing view? */
      replace: boolean;
      /* options from WITH clause */
      options?: PgNode[];
      /* WITH CHECK OPTION */
      withCheckOption: PgViewCheckOption;
    }
  }
  /* ----------------------
   *		Load Statement
   * ----------------------
   */
  interface PgLoadStmt extends PgNode {
    LoadStmt: {
      /* file to load */
      filename?: string;
    }
  }
  /* ----------------------
   *		Createdb Statement
   * ----------------------
   */
  interface PgCreatedbStmt extends PgNode {
    CreatedbStmt: {
      /* name of database to create */
      dbname?: string;
      /* List of DefElem nodes */
      options?: PgNode[];
    }
  }
  /* ----------------------
   *	Alter Database
   * ----------------------
   */
  interface PgAlterDatabaseStmt extends PgNode {
    AlterDatabaseStmt: {
      /* name of database to alter */
      dbname?: string;
      /* List of DefElem nodes */
      options?: PgNode[];
    }
  }
  /* ----------------------
   *	Alter Database
   * ----------------------
   */
  interface PgAlterDatabaseSetStmt extends PgNode {
    AlterDatabaseSetStmt: {
      /* database name */
      dbname?: string;
      /* SET or RESET subcommand */
      setstmt?: PgVariableSetStmt;
    }
  }
  /* ----------------------
   *		Dropdb Statement
   * ----------------------
   */
  interface PgDropdbStmt extends PgNode {
    DropdbStmt: {
      /* database to drop */
      dbname?: string;
      /* skip error if db is missing? */
      missing_ok: boolean;
    }
  }
  /* ----------------------
   *		Alter System Statement
   * ----------------------
   */
  interface PgAlterSystemStmt extends PgNode {
    AlterSystemStmt: {
      /* SET subcommand */
      setstmt?: PgVariableSetStmt;
    }
  }
  /* ----------------------
   *		Cluster Statement (support pbrown's cluster index implementation)
   * ----------------------
   */
  interface PgClusterStmt extends PgNode {
    ClusterStmt: {
      /* relation being indexed, or NULL if all */
      relation?: PgRangeVar;
      /* original index defined */
      indexname?: string;
      /* print progress info */
      verbose: boolean;
    }
  }
  /* ----------------------
   *		Vacuum and Analyze Statements
   *
   * Even though these are nominally two statements, it's convenient to use
   * just one node type for both.  Note that at least one of VACOPT_VACUUM
   * and VACOPT_ANALYZE must be set in options.
   * ----------------------
   */
  interface PgVacuumStmt extends PgNode {
    VacuumStmt: {
      /* OR of VacuumOption flags */
      options: number;
      /* single table to process, or NULL */
      relation?: PgRangeVar;
      /* list of column names, or NIL for all */
      va_cols?: PgNode[];
    }
  }
  /* ----------------------
   *		Explain Statement
   *
   * The "query" field is either a raw parse tree (SelectStmt, InsertStmt, etc)
   * or a Query node if parse analysis has been done.  Note that rewriting and
   * planning of the query are always postponed until execution of EXPLAIN.
   * ----------------------
   */
  interface PgExplainStmt extends PgNode {
    ExplainStmt: {
      /* the query (see comments above) */
      query?: PgNode;
      /* list of DefElem nodes */
      options?: PgNode[];
    }
  }
  /* ----------------------
   *		CREATE TABLE AS Statement (a/k/a SELECT INTO)
   *
   * A query written as CREATE TABLE AS will produce this node type natively.
   * A query written as SELECT ... INTO will be transformed to this form during
   * parse analysis.
   * A query written as CREATE MATERIALIZED view will produce this node type,
   * during parse analysis, since it needs all the same data.
   *
   * The "query" field is handled similarly to EXPLAIN, though note that it
   * can be a SELECT or an EXECUTE, but not other DML statements.
   * ----------------------
   */
  interface PgCreateTableAsStmt extends PgNode {
    CreateTableAsStmt: {
      /* the query (see comments above) */
      query?: PgNode;
      /* destination table */
      into?: PgIntoClause;
      /* OBJECT_TABLE or OBJECT_MATVIEW */
      relkind: PgObjectType;
      /* it was written as SELECT INTO */
      is_select_into: boolean;
      /* just do nothing if it already exists? */
      if_not_exists: boolean;
    }
  }
  /* ----------------------
   *		REFRESH MATERIALIZED VIEW Statement
   * ----------------------
   */
  interface PgRefreshMatViewStmt extends PgNode {
    RefreshMatViewStmt: {
      /* allow concurrent access? */
      concurrent: boolean;
      /* true for WITH NO DATA */
      skipData: boolean;
      /* relation to insert into */
      relation?: PgRangeVar;
    }
  }
  /* ----------------------
   * Checkpoint Statement
   * ----------------------
   */
  interface PgCheckPointStmt extends PgNode {
    CheckPointStmt: {

    }
  }
  /* ----------------------
   * Discard Statement
   * ----------------------
   */
  interface PgDiscardStmt extends PgNode {
    DiscardStmt: {
      /**/
      target: PgDiscardMode;
    }
  }
  /* ----------------------
   *		LOCK Statement
   * ----------------------
   */
  interface PgLockStmt extends PgNode {
    LockStmt: {
      /* relations to lock */
      relations?: PgNode[];
      /* lock mode */
      mode: number;
      /* no wait mode */
      nowait: boolean;
    }
  }
  /* ----------------------
   *		SET CONSTRAINTS Statement
   * ----------------------
   */
  interface PgConstraintsSetStmt extends PgNode {
    ConstraintsSetStmt: {
      /* List of names as RangeVars */
      constraints?: PgNode[];
      /**/
      deferred: boolean;
    }
  }
  /**/
  interface PgReindexStmt extends PgNode {
    ReindexStmt: {
      /* REINDEX_OBJECT_INDEX, REINDEX_OBJECT_TABLE,
      								 * etc. */

      kind: PgReindexObjectType;
      /* Table or index to reindex */
      relation?: PgRangeVar;
      /* name of database to reindex */
      name?: string;
      /* Reindex options flags */
      options: number;
    }
  }
  /* ----------------------
   *		CREATE CONVERSION Statement
   * ----------------------
   */
  interface PgCreateConversionStmt extends PgNode {
    CreateConversionStmt: {
      /* Name of the conversion */
      conversion_name?: PgNode[];
      /* source encoding name */
      for_encoding_name?: string;
      /* destination encoding name */
      to_encoding_name?: string;
      /* qualified conversion function name */
      func_name?: PgNode[];
      /* is this a default conversion? */
      def: boolean;
    }
  }
  /* ----------------------
   *	CREATE CAST Statement
   * ----------------------
   */
  interface PgCreateCastStmt extends PgNode {
    CreateCastStmt: {
      /**/
      sourcetype?: PgTypeName;
      /**/
      targettype?: PgTypeName;
      /**/
      func?: PgFuncWithArgs;
      /**/
      context: PgCoercionContext;
      /**/
      inout: boolean;
    }
  }
  /* ----------------------
   *	CREATE TRANSFORM Statement
   * ----------------------
   */
  interface PgCreateTransformStmt extends PgNode {
    CreateTransformStmt: {
      /**/
      replace: boolean;
      /**/
      type_name?: PgTypeName;
      /**/
      lang?: string;
      /**/
      fromsql?: PgFuncWithArgs;
      /**/
      tosql?: PgFuncWithArgs;
    }
  }
  /* ----------------------
   *		PREPARE Statement
   * ----------------------
   */
  interface PgPrepareStmt extends PgNode {
    PrepareStmt: {
      /* Name of plan, arbitrary */
      name?: string;
      /* Types of parameters (List of TypeName) */
      argtypes?: PgNode[];
      /* The query itself (as a raw parsetree) */
      query?: PgNode;
    }
  }
  /* ----------------------
   *		EXECUTE Statement
   * ----------------------
   */
  interface PgExecuteStmt extends PgNode {
    ExecuteStmt: {
      /* The name of the plan to execute */
      name?: string;
      /* Values to assign to parameters */
      params?: PgNode[];
    }
  }
  /* ----------------------
   *		DEALLOCATE Statement
   * ----------------------
   */
  interface PgDeallocateStmt extends PgNode {
    DeallocateStmt: {
      /* The name of the plan to remove */
      name?: string;
    }
  }
  /*
   *		DROP OWNED statement
   */
  interface PgDropOwnedStmt extends PgNode {
    DropOwnedStmt: {
      /**/
      roles?: PgNode[];
      /**/
      behavior: PgDropBehavior;
    }
  }
  /*
   *		REASSIGN OWNED statement
   */
  interface PgReassignOwnedStmt extends PgNode {
    ReassignOwnedStmt: {
      /**/
      roles?: PgNode[];
      /**/
      newrole?: PgNode;
    }
  }
  /*
   * TS Dictionary stmts: DefineStmt, RenameStmt and DropStmt are default
   */
  interface PgAlterTSDictionaryStmt extends PgNode {
    AlterTSDictionaryStmt: {
      /* qualified name (list of Value strings) */
      dictname?: PgNode[];
      /* List of DefElem nodes */
      options?: PgNode[];
    }
  }
  /**/
  interface PgAlterTSConfigurationStmt extends PgNode {
    AlterTSConfigurationStmt: {
      /* ALTER_TSCONFIG_ADD_MAPPING, etc */
      kind: PgAlterTSConfigType;
      /* qualified name (list of Value strings) */
      cfgname?: PgNode[];
      /* list of Value strings */
      tokentype?: PgNode[];
      /* list of list of Value strings */
      dicts?: PgNode[];
      /* if true - remove old variant */
      override: boolean;
      /* if true - replace dictionary by another */
      replace: boolean;
      /* for DROP - skip error if missing? */
      missing_ok: boolean;
    }
  }

  interface PgParseError extends Error {
    fileName: string;
    lineNumber: number;
    cursorPosition: number;
    functionName: string;
    context: string;
  }

  interface PgParseResult {
    query?: PgNode[];
    error?: PgParseError;
  }

  function parse(query: string): PgParseResult;
}