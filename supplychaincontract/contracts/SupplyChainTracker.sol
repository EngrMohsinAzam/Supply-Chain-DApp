// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title SupplyChainTracker
 * @dev Ultra-optimized smart contract for supply chain tracking
 */
contract SupplyChainTracker {
    
    enum ProductStatus { Manufactured, InTransit, WithDistributor, WithRetailer, Sold }
    enum UserRole { None, Manufacturer, Distributor, Retailer, Consumer }
    
    struct Product {
        string name;
        string batchNumber;
        uint256 manufacturingDate;
        address manufacturer;
        address currentOwner;
        ProductStatus status;
        bool isAuthentic;
        uint256 price;
    }
    
    struct User {
        string name;
        UserRole role;
        bool isVerified;
    }
    
    // Simplified state variables
    mapping(uint256 => Product) public products;
    mapping(address => User) public users;
    mapping(address => uint256) public userProductCount;
    
    uint256 public productCounter;
    address public owner;
    
    // Simplified events
    event ProductRegistered(uint256 indexed productId, address indexed manufacturer);
    event OwnershipTransferred(uint256 indexed productId, address indexed from, address indexed to);
    event UserRegistered(address indexed user, UserRole role);
    
    // Simplified modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    modifier onlyManufacturer() {
        require(users[msg.sender].role == UserRole.Manufacturer && users[msg.sender].isVerified, "Not verified manufacturer");
        _;
    }
    
    modifier productExists(uint256 _productId) {
        require(_productId <= productCounter && _productId > 0, "Invalid product");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        users[msg.sender].role = UserRole.Manufacturer;
        users[msg.sender].isVerified = true;
    }
    
    // Simplified user registration
    function registerUser(string calldata _name, UserRole _role) external {
        require(users[msg.sender].role == UserRole.None, "Already registered");
        require(_role != UserRole.None, "Invalid role");
        
        users[msg.sender].name = _name;
        users[msg.sender].role = _role;
        
        emit UserRegistered(msg.sender, _role);
    }
    
    function verifyUser(address _user) external onlyOwner {
        users[_user].isVerified = true;
    }
    
    // Simplified product registration
    function registerProduct(
        string calldata _name,
        string calldata _batchNumber,
        uint256 _price
    ) external onlyManufacturer returns (uint256) {
        
        productCounter++;
        uint256 productId = productCounter;
        
        Product storage product = products[productId];
        product.name = _name;
        product.batchNumber = _batchNumber;
        product.manufacturingDate = block.timestamp;
        product.manufacturer = msg.sender;
        product.currentOwner = msg.sender;
        product.status = ProductStatus.Manufactured;
        product.isAuthentic = true;
        product.price = _price;
        
        userProductCount[msg.sender]++;
        
        emit ProductRegistered(productId, msg.sender);
        return productId;
    }
    
    // Simplified transfer
    function transferProduct(uint256 _productId, address _to) external productExists(_productId) {
        require(products[_productId].currentOwner == msg.sender, "Not owner");
        require(users[_to].isVerified, "Recipient not verified");
        
        products[_productId].currentOwner = _to;
        products[_productId].status = _getNewStatus(users[_to].role);
        
        userProductCount[_to]++;
        
        emit OwnershipTransferred(_productId, msg.sender, _to);
    }
    
    // Basic verification
    function verifyProduct(uint256 _productId) external view productExists(_productId) returns (
        bool authentic,
        address manufacturer,
        address currentOwner,
        ProductStatus status
    ) {
        Product storage p = products[_productId];
        return (p.isAuthentic, p.manufacturer, p.currentOwner, p.status);
    }
    
    function getProduct(uint256 _productId) external view productExists(_productId) returns (Product memory) {
        return products[_productId];
    }
    
    function getUser(address _user) external view returns (User memory) {
        return users[_user];
    }
    
    function getTotalProducts() external view returns (uint256) {
        return productCounter;
    }
    
    // Internal helper
    function _getNewStatus(UserRole _role) internal pure returns (ProductStatus) {
        if (_role == UserRole.Distributor) return ProductStatus.WithDistributor;
        if (_role == UserRole.Retailer) return ProductStatus.WithRetailer;
        if (_role == UserRole.Consumer) return ProductStatus.Sold;
        return ProductStatus.WithRetailer;
    }
    
    // Admin functions
    function markCounterfeit(uint256 _productId) external onlyOwner productExists(_productId) {
        products[_productId].isAuthentic = false;
    }
    
    function updatePrice(uint256 _productId, uint256 _price) external productExists(_productId) {
        require(products[_productId].currentOwner == msg.sender, "Not owner");
        products[_productId].price = _price;
    }
}